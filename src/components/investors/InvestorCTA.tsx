import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";

const INVESTOR_EMAIL = "info@carwashap.com";

const InvestorCTA = () => {
  const [form, setForm] = useState({ name: "", email: "", firm: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Investor inquiry from ${form.name}${form.firm ? ` (${form.firm})` : ""}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nFirm: ${form.firm}\n\n${form.message}`
    );
    window.location.href = `mailto:${INVESTOR_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-start">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary-foreground/80 font-semibold mb-3">
              Investor Relations
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Let's build the future of car care, together.
            </h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
              We're talking to mission-aligned investors interested in sustainable
              consumer services and the US expansion of proven European models.
            </p>
            <a
              href={`mailto:${INVESTOR_EMAIL}`}
              className="inline-flex items-center gap-3 text-lg font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            >
              <Mail className="h-5 w-5" />
              {INVESTOR_EMAIL}
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-primary-foreground rounded-2xl p-6 md:p-8 text-foreground shadow-2xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="firm">Firm</Label>
                <Input
                  id="firm"
                  value={form.firm}
                  onChange={(e) => setForm({ ...form, firm: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                rows={4}
                placeholder="Tell us a bit about your fund and your interest in Car Washap."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Send inquiry
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Opens your email client. We typically respond within 2 business days.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InvestorCTA;
