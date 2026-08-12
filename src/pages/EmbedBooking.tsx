import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { StepOne } from "@/components/booking/StepOne";
import { StepTwo } from "@/components/booking/StepTwo";
import { StepThree } from "@/components/booking/StepThree";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { useBookingForm } from "@/hooks/useBookingForm";

const EmbedBooking = () => {
  const booking = useBookingForm();

  if (booking.bookingSuccess) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bokning bekräftad!</h2>
            <p className="text-muted-foreground mb-4">
              Din bokning har registrerats. Du kommer få en bekräftelse via e-post på {booking.customerEmail}.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Boka en till tid
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://carwashap.se', '_blank')}
              >
                Besök Car Washap
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Boka biltvätt</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Välj tjänst och tid för din biltvätt
          </p>
        </div>

        <StepIndicator
          currentStep={booking.currentStep}
          onStepClick={booking.setCurrentStep}
          canNavigateToStep={booking.canNavigateToStep}
        />

        <div className="flex gap-6">
          <Card className="flex-1">
            <CardContent className="pt-4">
              <form onSubmit={booking.handleSubmit}>
                {booking.currentStep === 1 && (
                  <StepOne
                    serviceType={booking.serviceType}
                    setServiceType={booking.setServiceType}
                    vehicleSize={booking.vehicleSize}
                    setVehicleSize={booking.setVehicleSize}
                    selectedAddons={booking.selectedAddons}
                    toggleAddon={booking.toggleAddon}
                    selectedExtras={booking.selectedExtras}
                    toggleExtra={booking.toggleExtra}
                    totalPrice={booking.calculateTotalPrice()}
                    onNext={() => booking.setCurrentStep(2)}
                    canProceed={booking.canProceedStep1}
                  />
                )}

                {booking.currentStep === 2 && (
                  <StepTwo
                    facilities={booking.facilities}
                    selectedFacility={booking.selectedFacility}
                    setSelectedFacility={booking.setSelectedFacility}
                    date={booking.date}
                    setDate={booking.setDate}
                    time={booking.time}
                    setTime={booking.setTime}
                    timeSlots={booking.timeSlots}
                    loadingTimes={booking.loadingTimes}
                    capacity={booking.capacity}
                    isTimeSlotInPast={booking.isTimeSlotInPast}
                    hasNoAvailableTimes={booking.hasNoAvailableTimes}
                    findNextAvailableDate={booking.findNextAvailableDate}
                    searchingNextAvailable={booking.searchingNextAvailable}
                    getTimeSlotStatus={booking.getTimeSlotStatus}
                    getAffectedSlots={booking.getAffectedSlots}
                    serviceType={booking.serviceType}
                    serviceDuration={booking.serviceDuration}
                    facilityCloseHour={booking.facilityCloseHour}
                    onNext={() => booking.setCurrentStep(3)}
                    onBack={() => booking.setCurrentStep(1)}
                    canProceed={booking.canProceedStep2}
                  />
                )}

                {booking.currentStep === 3 && (
                  <StepThree
                    customerName={booking.customerName}
                    setCustomerName={booking.setCustomerName}
                    customerEmail={booking.customerEmail}
                    setCustomerEmail={booking.setCustomerEmail}
                    customerPhone={booking.customerPhone}
                    setCustomerPhone={booking.setCustomerPhone}
                    vehicleBrand={booking.vehicleBrand}
                    setVehicleBrand={booking.setVehicleBrand}
                    vehicleModel={booking.vehicleModel}
                    setVehicleModel={booking.setVehicleModel}
                    vehicleRegistration={booking.vehicleRegistration}
                    setVehicleRegistration={booking.setVehicleRegistration}
                    onBack={() => booking.setCurrentStep(2)}
                    onSubmit={booking.handleSubmit}
                    loading={booking.loading}
                    canSubmit={booking.canSubmit}
                  />
                )}
              </form>
            </CardContent>
          </Card>

          <BookingSummary
            formData={booking.formData}
            facility={booking.selectedFacilityData}
            totalPrice={booking.calculateTotalPrice()}
            className="w-80"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Drivs av{" "}
          <a
            href="https://carwashap.se"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Car Washap
          </a>
        </p>
      </div>
    </div>
  );
};

export default EmbedBooking;
