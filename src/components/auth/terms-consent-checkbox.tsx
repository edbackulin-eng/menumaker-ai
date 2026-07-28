import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";

export interface TermsConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  prefix: string;
  privacyLabel: string;
  and: string;
  termsLabel: string;
  suffix: string;
}

/**
 * Shared between the email registration form and /oauth-consent — both need
 * the exact same "I agree to the Privacy Policy and Terms of Service"
 * checkbox with two links opening in a new tab, just with different
 * surrounding copy pulled from different translation namespaces.
 */
export function TermsConsentCheckbox({
  checked,
  onCheckedChange,
  error,
  prefix,
  privacyLabel,
  and,
  termsLabel,
  suffix,
}: TermsConsentCheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        label={
          <>
            {prefix}{" "}
            <Link
              href="/privacy"
              className="text-accent-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {privacyLabel}
            </Link>{" "}
            {and}{" "}
            <Link
              href="/terms"
              className="text-accent-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {termsLabel}
            </Link>
            {suffix}
          </>
        }
      />
      {error && <p className="text-body-sm text-error-600">{error}</p>}
    </div>
  );
}
