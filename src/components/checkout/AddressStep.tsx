import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/content/tr";
import type { CheckoutAddress } from "@/types";

const e = tr.checkout.errors;

/** Tüm alanlar hem uzunluk hem biçim yönünden doğrulanır. */
const addressSchema = z.object({
  fullName: z.string().trim().min(3, e.fullNameShort).max(80, e.tooLong),
  phone: z
    .string()
    .trim()
    .min(10, e.phoneInvalid)
    .max(20, e.tooLong)
    .regex(/^[0-9+()\s-]+$/, e.phoneInvalid),
  email: z.string().trim().email(e.emailInvalid).max(160, e.tooLong),
  city: z.string().trim().min(2, e.required).max(60, e.tooLong),
  district: z.string().trim().min(2, e.required).max(60, e.tooLong),
  addressLine: z.string().trim().min(10, e.addressShort).max(400, e.tooLong),
  note: z.string().trim().max(300, e.tooLong),
});

export function AddressStep({
  defaultValues,
  onSubmit,
}: {
  defaultValues: CheckoutAddress | null;
  onSubmit: (address: CheckoutAddress) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues ?? {
      fullName: "",
      phone: "",
      email: "",
      city: "",
      district: "",
      addressLine: "",
      note: "",
    },
  });

  const f = tr.checkout.form;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
    >
      <h2 className="text-base font-semibold text-primary-deep">{tr.checkout.steps.address}</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label={f.fullName} error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" maxLength={80} {...register("fullName")} />
        </Field>
        <Field id="phone" label={f.phone} error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder={f.phonePlaceholder}
            {...register("phone")}
          />
        </Field>
        <Field id="email" label={f.email} error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            maxLength={160}
            placeholder={f.emailPlaceholder}
            {...register("email")}
          />
        </Field>
        <Field id="city" label={f.city} error={errors.city?.message}>
          <Input
            id="city"
            autoComplete="address-level1"
            maxLength={60}
            placeholder={f.cityPlaceholder}
            {...register("city")}
          />
        </Field>
        <Field id="district" label={f.district} error={errors.district?.message}>
          <Input
            id="district"
            autoComplete="address-level2"
            maxLength={60}
            placeholder={f.districtPlaceholder}
            {...register("district")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="addressLine" label={f.addressLine} error={errors.addressLine?.message}>
            <Textarea
              id="addressLine"
              rows={3}
              maxLength={400}
              autoComplete="street-address"
              placeholder={f.addressPlaceholder}
              {...register("addressLine")}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="note" label={f.note} error={errors.note?.message}>
            <Textarea
              id="note"
              rows={2}
              maxLength={300}
              placeholder={f.notePlaceholder}
              {...register("note")}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit" className="rounded-full">
          {tr.checkout.next}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
