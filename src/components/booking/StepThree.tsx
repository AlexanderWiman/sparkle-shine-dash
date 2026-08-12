import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  validateCustomerInfo, 
  validateField, 
  type ValidationErrors 
} from "@/lib/bookingValidation";

interface StepThreeProps {
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  vehicleBrand: string;
  setVehicleBrand: (value: string) => void;
  vehicleModel: string;
  setVehicleModel: (value: string) => void;
  vehicleRegistration: string;
  setVehicleRegistration: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  canSubmit: boolean;
}

export function StepThree({
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  vehicleBrand,
  setVehicleBrand,
  vehicleModel,
  setVehicleModel,
  vehicleRegistration,
  setVehicleRegistration,
  onBack,
  onSubmit,
  loading,
}: StepThreeProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  const formData = {
    customerName,
    customerEmail,
    customerPhone,
    vehicleBrand,
    vehicleModel,
    vehicleRegistration,
  };

  const { isValid, errors: validationErrors } = validateCustomerInfo(formData);

  useEffect(() => {
    if (attemptedSubmit) {
      setErrors(validationErrors);
    } else {
      // Only show errors for touched fields
      const touchedErrors: ValidationErrors = {};
      Object.keys(touched).forEach((field) => {
        if (touched[field] && validationErrors[field as keyof ValidationErrors]) {
          touchedErrors[field as keyof ValidationErrors] = 
            validationErrors[field as keyof ValidationErrors];
        }
      });
      setErrors(touchedErrors);
    }
  }, [formData, touched, attemptedSubmit]);

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(e);
  };

  const getInputState = (field: keyof ValidationErrors, value: string) => {
    if (!touched[field] && !attemptedSubmit) return 'default';
    if (errors[field]) return 'error';
    if (value.trim()) return 'valid';
    return 'default';
  };

  const inputClassName = (field: keyof ValidationErrors, value: string) => {
    const state = getInputState(field, value);
    if (state === 'error') return 'border-destructive focus-visible:ring-destructive';
    if (state === 'valid') return 'border-green-500 focus-visible:ring-green-500';
    return '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Dina uppgifter</h2>
        <p className="text-muted-foreground">Fyll i kontaktuppgifter och bilinfo</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Kontaktuppgifter</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Namn *</Label>
          <div className="relative">
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => handleBlur('customerName')}
              placeholder="Ditt namn"
              className={inputClassName('customerName', customerName)}
              maxLength={100}
            />
            {getInputState('customerName', customerName) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.customerName && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.customerName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-post *</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={() => handleBlur('customerEmail')}
              placeholder="din@email.com"
              className={inputClassName('customerEmail', customerEmail)}
              maxLength={255}
            />
            {getInputState('customerEmail', customerEmail) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.customerEmail && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.customerEmail}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={() => handleBlur('customerPhone')}
              placeholder="070-123 45 67"
              className={inputClassName('customerPhone', customerPhone)}
              maxLength={20}
            />
            {getInputState('customerPhone', customerPhone) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.customerPhone && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.customerPhone}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Biluppgifter</h3>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleBrand">Bilmärke *</Label>
          <div className="relative">
            <Input
              id="vehicleBrand"
              value={vehicleBrand}
              onChange={(e) => setVehicleBrand(e.target.value)}
              onBlur={() => handleBlur('vehicleBrand')}
              placeholder="t.ex. Volvo"
              className={inputClassName('vehicleBrand', vehicleBrand)}
              maxLength={50}
            />
            {getInputState('vehicleBrand', vehicleBrand) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.vehicleBrand && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.vehicleBrand}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleModel">Modell *</Label>
          <div className="relative">
            <Input
              id="vehicleModel"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              onBlur={() => handleBlur('vehicleModel')}
              placeholder="t.ex. V70"
              className={inputClassName('vehicleModel', vehicleModel)}
              maxLength={50}
            />
            {getInputState('vehicleModel', vehicleModel) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.vehicleModel && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.vehicleModel}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleRegistration">Registreringsnummer *</Label>
          <div className="relative">
            <Input
              id="vehicleRegistration"
              value={vehicleRegistration}
              onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
              onBlur={() => handleBlur('vehicleRegistration')}
              placeholder="ABC 123"
              className={inputClassName('vehicleRegistration', vehicleRegistration)}
              maxLength={7}
            />
            {getInputState('vehicleRegistration', vehicleRegistration) === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.vehicleRegistration && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.vehicleRegistration}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Format: ABC 123 eller ABC123</p>
        </div>
      </div>

      <div className="flex items-start space-x-3 rounded-md border p-4 bg-muted/50">
        <Checkbox
          id="gdpr-consent"
          checked={gdprConsent}
          onCheckedChange={(checked) => setGdprConsent(checked === true)}
        />
        <Label htmlFor="gdpr-consent" className="text-sm leading-relaxed cursor-pointer">
          Jag godkänner att den angivna informationen lagras i syfte att hantera min bokning. 
          Uppgifterna delas inte med tredje part. Kontakta oss på{" "}
          <a href="mailto:info@carwashap.com" className="underline text-primary">info@carwashap.com</a>{" "}
          om du vill få dina uppgifter raderade.
        </Label>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !isValid || !gdprConsent}
          className="min-w-32"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Bokar...
            </>
          ) : (
            "Bekräfta bokning"
          )}
        </Button>
      </div>
    </div>
  );
}
