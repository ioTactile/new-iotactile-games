import {
  useForm,
  UseFormProps,
  UseFormReturn,
  type FieldValues,
} from "react-hook-form";
import { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Hook générique pour brancher un schéma Zod à React Hook Form.
 * @param schema Le schéma Zod à utiliser pour la validation.
 * @param options Options additionnelles pour useForm.
 */
export function useZodForm<TValues extends FieldValues>(
  schema: ZodType<TValues, TValues>,
  options?: Omit<UseFormProps<TValues>, "resolver">,
): UseFormReturn<TValues> {
  return useForm<TValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    ...options,
  });
}
