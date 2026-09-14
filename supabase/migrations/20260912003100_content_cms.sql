CREATE TABLE public.content_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), market_id uuid NOT NULL REFERENCES public.markets(id) ON DELETE RESTRICT,
 locale text NOT NULL DEFAULT 'tr-TR', content_type text NOT NULL CHECK(content_type IN('article','page','faq')),
 slug text NOT NULL CHECK(slug~'^[a-z0-9]+(?:-[a-z0-9]+)*$'), title text NOT NULL CHECK(char_length(title) BETWEEN 3 AND 160),
 excerpt text NOT NULL DEFAULT '' CHECK(char_length(excerpt)<=320), body text NOT NULL DEFAULT '', category text NOT NULL DEFAULT 'Genel',
 seo_title text CHECK(char_length(seo_title)<=60), seo_description text CHECK(char_length(seo_description)<=160),
 canonical_path text, cover_image_url text, status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','review','published','archived')),
 version integer NOT NULL DEFAULT 1, published_at timestamptz, created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(market_id,locale,slug),CHECK(status<>'published' OR published_at IS NOT NULL)
);
CREATE INDEX content_entries_public_idx ON public.content_entries(market_id,locale,published_at DESC) WHERE status='published';
ALTER TABLE public.content_entries ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.content_entries TO anon,authenticated; GRANT ALL ON public.content_entries TO service_role;
CREATE POLICY "Published content is public" ON public.content_entries FOR SELECT USING(status='published' AND published_at<=now());
CREATE TRIGGER content_entries_set_updated_at BEFORE UPDATE ON public.content_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.admin_list_content(p_actor_id uuid,p_market_code text DEFAULT 'TR') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid; BEGIN IF NOT public.has_permission(p_actor_id,'content.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN'; END IF;
SELECT id INTO v_market FROM public.markets WHERE code=upper(p_market_code); RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'locale',c.locale,'contentType',c.content_type,'slug',c.slug,'title',c.title,'excerpt',c.excerpt,'body',c.body,'category',c.category,'seoTitle',c.seo_title,'seoDescription',c.seo_description,'canonicalPath',c.canonical_path,'coverImageUrl',c.cover_image_url,'status',c.status,'version',c.version,'publishedAt',c.published_at,'updatedAt',c.updated_at) ORDER BY c.updated_at DESC),'[]'::jsonb) FROM public.content_entries c WHERE c.market_id=v_market); END $$;
CREATE OR REPLACE FUNCTION public.admin_save_content(p_actor_id uuid,p_id uuid,p_market_code text,p_locale text,p_content_type text,p_slug text,p_title text,p_excerpt text,p_body text,p_category text,p_seo_title text,p_seo_description text,p_canonical_path text,p_cover_image_url text,p_status text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_market uuid;v_id uuid; BEGIN IF NOT public.has_permission(p_actor_id,'content.manage') THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='FORBIDDEN';END IF; SELECT id INTO v_market FROM public.markets WHERE code=upper(p_market_code); IF v_market IS NULL THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='MARKET_NOT_FOUND';END IF;
IF p_id IS NULL THEN INSERT INTO public.content_entries(market_id,locale,content_type,slug,title,excerpt,body,category,seo_title,seo_description,canonical_path,cover_image_url,status,published_at,created_by,updated_by) VALUES(v_market,p_locale,p_content_type,p_slug,p_title,p_excerpt,p_body,p_category,p_seo_title,p_seo_description,p_canonical_path,p_cover_image_url,p_status,CASE WHEN p_status='published' THEN now() END,p_actor_id,p_actor_id) RETURNING id INTO v_id;
ELSE UPDATE public.content_entries SET locale=p_locale,content_type=p_content_type,slug=p_slug,title=p_title,excerpt=p_excerpt,body=p_body,category=p_category,seo_title=p_seo_title,seo_description=p_seo_description,canonical_path=p_canonical_path,cover_image_url=p_cover_image_url,status=p_status,published_at=CASE WHEN p_status='published' THEN coalesce(published_at,now()) ELSE NULL END,version=version+1,updated_by=p_actor_id WHERE id=p_id AND market_id=v_market RETURNING id INTO v_id;END IF;
INSERT INTO public.audit_events(market_id,actor_id,actor_type,action,resource_type,resource_id,metadata) VALUES(v_market,p_actor_id,'admin','content.saved','content',v_id::text,jsonb_build_object('status',p_status,'slug',p_slug));RETURN v_id;END $$;
REVOKE ALL ON FUNCTION public.admin_list_content(uuid,text),public.admin_save_content(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_content(uuid,text),public.admin_save_content(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) TO service_role;
