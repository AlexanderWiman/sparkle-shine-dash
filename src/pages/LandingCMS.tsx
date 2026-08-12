import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Upload, Trash2, Plus, GripVertical, PanelLeft, Columns2, Eye, Type, MousePointer, Image as ImageIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SectionPreview from "@/components/cms/SectionPreview";
import {
  fetchLandingContent,
  updateLandingSection,
  uploadLandingImage,
  HeroContent,
  ServicesContent,
  ServiceItem,
  BenefitsContent,
  BenefitItem,
  CTAContent,
  PricingContent,
  PricingComboService,
  PricingExtraService,
  AboutContent,
  AboutStorySection,
  AboutValue,
  PressContent,
  PressArticle,
  FAQContent,
  FAQItem,
  ContactContent,
  FooterLink,
} from "@/lib/landingContentApi";

const iconOptions = [
  { value: "car", label: "Bil" },
  { value: "droplets", label: "Droppar" },
  { value: "sparkles", label: "Gnistrar" },
  { value: "shield", label: "Sköld" },
  { value: "star", label: "Stjärna" },
  { value: "clock", label: "Klocka" },
  { value: "timer", label: "Timer" },
  { value: "check-circle", label: "Bock" },
  { value: "hand", label: "Hand" },
  { value: "calendar", label: "Kalender" },
];

const LandingCMS = () => {
  const queryClient = useQueryClient();
  const [heroData, setHeroData] = useState<HeroContent | null>(null);
  const [servicesData, setServicesData] = useState<ServicesContent | null>(null);
  const [benefitsData, setBenefitsData] = useState<BenefitsContent | null>(null);
  const [ctaData, setCtaData] = useState<CTAContent | null>(null);
  const [pricingData, setPricingData] = useState<PricingContent | null>(null);
  const [aboutData, setAboutData] = useState<AboutContent | null>(null);
  const [pressData, setPressData] = useState<PressContent | null>(null);
  const [faqData, setFaqData] = useState<FAQContent | null>(null);
  const [contactData, setContactData] = useState<ContactContent | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState<"editor" | "split" | "preview">("split");
  const [activeTab, setActiveTab] = useState("hero");

  const { data: content, isLoading } = useQuery({
    queryKey: ["landing-content"],
    queryFn: fetchLandingContent,
  });

  useEffect(() => {
    if (content) {
      setHeroData(content.hero);
      setServicesData(content.services);
      setBenefitsData(content.benefits);
      setCtaData(content.cta);
      setPricingData(content.pricing || null);
      setAboutData(content.about || null);
      setPressData(content.press || null);
      setFaqData(content.faq || null);
      setContactData(content.contact || null);
    }
  }, [content]);

  const saveMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: object }) => {
      const success = await updateLandingSection(section, data);
      if (!success) throw new Error("Failed to save");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-content"] });
      toast.success("Ändringar sparade!");
    },
    onError: () => {
      toast.error("Kunde inte spara ändringar");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadLandingImage(file);
      if (url && heroData) {
        setHeroData({ ...heroData, backgroundImage: url });
        toast.success("Bild uppladdad!");
      } else {
        toast.error("Kunde inte ladda upp bild");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadLandingImage(file);
      if (url && heroData) {
        setHeroData({ ...heroData, backgroundVideo: url });
        toast.success("Video uppladdad!");
      } else {
        toast.error("Kunde inte ladda upp video");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const addServiceItem = () => {
    if (!servicesData) return;
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      title: "Ny tjänst",
      description: "Beskrivning av tjänsten",
      icon: "car",
      price: "0:-",
      popular: false,
    };
    setServicesData({
      ...servicesData,
      items: [...servicesData.items, newItem],
    });
  };

  const removeServiceItem = (id: string) => {
    if (!servicesData) return;
    setServicesData({
      ...servicesData,
      items: servicesData.items.filter((item) => item.id !== id),
    });
  };

  const updateServiceItem = (id: string, updates: Partial<ServiceItem>) => {
    if (!servicesData) return;
    setServicesData({
      ...servicesData,
      items: servicesData.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const addBenefitItem = () => {
    if (!benefitsData) return;
    const newItem: BenefitItem = {
      id: Date.now().toString(),
      title: "Ny fördel",
      description: "Beskrivning av fördelen",
      icon: "star",
    };
    setBenefitsData({
      ...benefitsData,
      items: [...benefitsData.items, newItem],
    });
  };

  const removeBenefitItem = (id: string) => {
    if (!benefitsData) return;
    setBenefitsData({
      ...benefitsData,
      items: benefitsData.items.filter((item) => item.id !== id),
    });
  };

  const updateBenefitItem = (id: string, updates: Partial<BenefitItem>) => {
    if (!benefitsData) return;
    setBenefitsData({
      ...benefitsData,
      items: benefitsData.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Pricing functions
  const addComboService = () => {
    if (!pricingData) return;
    const newItem: PricingComboService = {
      title: "Nytt paket",
      price: "fr. 0",
      numericPrice: 0,
      description: "Beskrivning av paketet",
      popular: false,
    };
    setPricingData({
      ...pricingData,
      comboServices: [...pricingData.comboServices, newItem],
    });
  };

  const removeComboService = (index: number) => {
    if (!pricingData) return;
    setPricingData({
      ...pricingData,
      comboServices: pricingData.comboServices.filter((_, i) => i !== index),
    });
  };

  const updateComboService = (index: number, updates: Partial<PricingComboService>) => {
    if (!pricingData) return;
    setPricingData({
      ...pricingData,
      comboServices: pricingData.comboServices.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    });
  };

  const addExtraService = () => {
    if (!pricingData) return;
    const newItem: PricingExtraService = {
      name: "Ny tjänst",
      price: "0:-",
    };
    setPricingData({
      ...pricingData,
      extraServices: [...pricingData.extraServices, newItem],
    });
  };

  const removeExtraService = (index: number) => {
    if (!pricingData) return;
    setPricingData({
      ...pricingData,
      extraServices: pricingData.extraServices.filter((_, i) => i !== index),
    });
  };

  const updateExtraService = (index: number, updates: Partial<PricingExtraService>) => {
    if (!pricingData) return;
    setPricingData({
      ...pricingData,
      extraServices: pricingData.extraServices.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    });
  };

  // About functions
  const addStorySection = () => {
    if (!aboutData) return;
    const newItem: AboutStorySection = {
      icon: "lightbulb",
      title: "Ny sektion",
      description: "Beskrivning av sektionen",
    };
    setAboutData({
      ...aboutData,
      storySections: [...aboutData.storySections, newItem],
    });
  };

  const removeStorySection = (index: number) => {
    if (!aboutData) return;
    setAboutData({
      ...aboutData,
      storySections: aboutData.storySections.filter((_, i) => i !== index),
    });
  };

  const updateStorySection = (index: number, updates: Partial<AboutStorySection>) => {
    if (!aboutData) return;
    setAboutData({
      ...aboutData,
      storySections: aboutData.storySections.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    });
  };

  const addValue = () => {
    if (!aboutData) return;
    const newItem: AboutValue = {
      icon: "star",
      title: "Ny värdering",
      description: "Beskrivning av värderingen",
    };
    setAboutData({
      ...aboutData,
      values: [...aboutData.values, newItem],
    });
  };

  const removeValue = (index: number) => {
    if (!aboutData) return;
    setAboutData({
      ...aboutData,
      values: aboutData.values.filter((_, i) => i !== index),
    });
  };

  const updateValue = (index: number, updates: Partial<AboutValue>) => {
    if (!aboutData) return;
    setAboutData({
      ...aboutData,
      values: aboutData.values.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    });
  };

  // Press functions
  const addPressArticle = () => {
    if (!pressData) return;
    const newItem: PressArticle = {
      id: Date.now().toString(),
      title: "Ny pressartikel",
      source: "Källa",
      date: new Date().toISOString().split("T")[0],
      dateFormatted: "Datum",
      description: "Beskrivning av artikeln",
      url: "https://",
    };
    setPressData({
      ...pressData,
      articles: [...pressData.articles, newItem],
    });
  };

  const removePressArticle = (id: string) => {
    if (!pressData) return;
    setPressData({
      ...pressData,
      articles: pressData.articles.filter((a) => a.id !== id),
    });
  };

  const updatePressArticle = (id: string, updates: Partial<PressArticle>) => {
    if (!pressData) return;
    setPressData({
      ...pressData,
      articles: pressData.articles.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // FAQ functions
  const addFAQItem = () => {
    if (!faqData) return;
    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: "Ny fråga",
      answer: "Svar på frågan",
    };
    setFaqData({
      ...faqData,
      items: [...faqData.items, newItem],
    });
  };

  const removeFAQItem = (id: string) => {
    if (!faqData) return;
    setFaqData({
      ...faqData,
      items: faqData.items.filter((item) => item.id !== id),
    });
  };

  const updateFAQItem = (id: string, updates: Partial<FAQItem>) => {
    if (!faqData) return;
    setFaqData({
      ...faqData,
      items: faqData.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  const renderEditorContent = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {/* Section headers with grouped tabs */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Landningssidan</p>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="services">Tjänster</TabsTrigger>
            <TabsTrigger value="benefits">Fördelar</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="cta">CTA</TabsTrigger>
          </TabsList>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Undersidor</p>
          <TabsList className="grid w-max grid-cols-3 gap-1">
            <TabsTrigger value="pricing">Priser</TabsTrigger>
            <TabsTrigger value="about">Om oss</TabsTrigger>
            <TabsTrigger value="press">Press</TabsTrigger>
          </TabsList>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Gemensamt</p>
          <TabsList className="grid w-max grid-cols-1 gap-1">
            <TabsTrigger value="contact">Sidfot & Kontakt</TabsTrigger>
          </TabsList>
        </div>
      </div>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero-sektion</CardTitle>
                <CardDescription>
                  Huvudsektionen som visas överst på landningssidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {heroData && (
                  <>
                    {/* Text & Rubriker */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text & Rubriker
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hero-title">Rubrik</Label>
                          <Input
                            id="hero-title"
                            value={heroData.title}
                            onChange={(e) =>
                              setHeroData({ ...heroData, title: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hero-highlight">Markerad text (grön)</Label>
                          <Input
                            id="hero-highlight"
                            value={heroData.highlightedText}
                            onChange={(e) =>
                              setHeroData({
                                ...heroData,
                                highlightedText: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hero-subtitle">Underrubrik</Label>
                          <Textarea
                            id="hero-subtitle"
                            value={heroData.subtitle}
                            onChange={(e) =>
                              setHeroData({ ...heroData, subtitle: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Knappar */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <MousePointer className="h-4 w-4" />
                        Knappar
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hero-cta">Primär knapptext</Label>
                          <Input
                            id="hero-cta"
                            value={heroData.ctaText}
                            onChange={(e) =>
                              setHeroData({ ...heroData, ctaText: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hero-secondary">Sekundär knapptext</Label>
                          <Input
                            id="hero-secondary"
                            value={heroData.secondaryCtaText}
                            onChange={(e) =>
                              setHeroData({
                                ...heroData,
                                secondaryCtaText: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bakgrundsmedia */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Bakgrundsmedia
                      </h3>
                      <p className="text-xs text-muted-foreground -mt-2">
                        Video prioriteras om den finns, annars används bilden.
                      </p>
                      
                      {/* Bakgrundsbild */}
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Bild</Label>
                        {heroData.backgroundImage && (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden mb-2">
                            <img
                              src={heroData.backgroundImage}
                              alt="Hero background"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() =>
                                setHeroData({ ...heroData, backgroundImage: null })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="flex-1"
                          />
                          {uploadingImage && (
                            <span className="text-sm text-muted-foreground">
                              Laddar upp...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bakgrundsvideo - uppladdad */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Video (ladda upp)</Label>
                        {heroData.backgroundVideo && (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden mb-2">
                            <video
                              src={heroData.backgroundVideo}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() =>
                                setHeroData({ ...heroData, backgroundVideo: null })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            disabled={uploadingImage}
                            className="flex-1"
                          />
                          {uploadingImage && (
                            <span className="text-sm text-muted-foreground">
                              Laddar upp...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          MP4-format rekommenderas.
                        </p>
                      </div>

                      {/* Bakgrundsvideo - URL */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Video (länk)</Label>
                        <Input
                          id="hero-video-url"
                          type="url"
                          placeholder="https://example.com/video.mp4"
                          value={heroData.backgroundVideoUrl || ""}
                          onChange={(e) =>
                            setHeroData({
                              ...heroData,
                              backgroundVideoUrl: e.target.value || null,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Länk används om ingen fil är uppladdad.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "hero", data: heroData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Hero
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Section */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Tjänster</CardTitle>
                <CardDescription>
                  Hantera tjänsterna som visas på landningssidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {servicesData && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="services-title">Sektionsrubrik</Label>
                      <Input
                        id="services-title"
                        value={servicesData.title}
                        onChange={(e) =>
                          setServicesData({
                            ...servicesData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="services-subtitle">Sektionsunderrubrik</Label>
                      <Input
                        id="services-subtitle"
                        value={servicesData.subtitle}
                        onChange={(e) =>
                          setServicesData({
                            ...servicesData,
                            subtitle: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Tjänster</Label>
                        <Button variant="outline" size="sm" onClick={addServiceItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>

                      {servicesData.items.map((item, index) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label>Titel</Label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) =>
                                      updateServiceItem(item.id, {
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Pris</Label>
                                  <Input
                                    value={item.price}
                                    onChange={(e) =>
                                      updateServiceItem(item.id, {
                                        price: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Input
                                  value={item.description}
                                  onChange={(e) =>
                                    updateServiceItem(item.id, {
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label>Ikon</Label>
                                  <select
                                    value={item.icon}
                                    onChange={(e) =>
                                      updateServiceItem(item.id, {
                                        icon: e.target.value,
                                      })
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                  >
                                    {iconOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label>Populär</Label>
                                  <Switch
                                    checked={item.popular || false}
                                    onCheckedChange={(checked) =>
                                      updateServiceItem(item.id, { popular: checked })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeServiceItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({
                          section: "services",
                          data: servicesData,
                        })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Tjänster
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefits Section */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle>Fördelar</CardTitle>
                <CardDescription>
                  Hantera fördelarna som visas på landningssidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {benefitsData && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="benefits-title">Sektionsrubrik</Label>
                      <Input
                        id="benefits-title"
                        value={benefitsData.title}
                        onChange={(e) =>
                          setBenefitsData({
                            ...benefitsData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Fördelar</Label>
                        <Button variant="outline" size="sm" onClick={addBenefitItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>

                      {benefitsData.items.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label>Titel</Label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) =>
                                      updateBenefitItem(item.id, {
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Ikon</Label>
                                  <select
                                    value={item.icon}
                                    onChange={(e) =>
                                      updateBenefitItem(item.id, {
                                        icon: e.target.value,
                                      })
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                  >
                                    {iconOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Input
                                  value={item.description}
                                  onChange={(e) =>
                                    updateBenefitItem(item.id, {
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBenefitItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({
                          section: "benefits",
                          data: benefitsData,
                        })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Fördelar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CTA Section */}
          <TabsContent value="cta">
            <Card>
              <CardHeader>
                <CardTitle>Call-to-Action</CardTitle>
                <CardDescription>
                  CTA-bandet som visas på landningssidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {ctaData && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cta-title">Rubrik</Label>
                      <Input
                        id="cta-title"
                        value={ctaData.title}
                        onChange={(e) =>
                          setCtaData({ ...ctaData, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta-subtitle">Underrubrik</Label>
                      <Input
                        id="cta-subtitle"
                        value={ctaData.subtitle}
                        onChange={(e) =>
                          setCtaData({ ...ctaData, subtitle: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cta-button">Knapptext</Label>
                      <Input
                        id="cta-button"
                        value={ctaData.buttonText}
                        onChange={(e) =>
                          setCtaData({ ...ctaData, buttonText: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "cta", data: ctaData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara CTA
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Section */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Prissidan</CardTitle>
                <CardDescription>
                  Redigera innehållet på prissidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {pricingData && (
                  <>
                    {/* Hero */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Hero-sektion</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pricing-hero-title">Rubrik</Label>
                        <Input
                          id="pricing-hero-title"
                          value={pricingData.heroTitle}
                          onChange={(e) =>
                            setPricingData({ ...pricingData, heroTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricing-hero-subtitle">Underrubrik</Label>
                        <Textarea
                          id="pricing-hero-subtitle"
                          value={pricingData.heroSubtitle}
                          onChange={(e) =>
                            setPricingData({ ...pricingData, heroSubtitle: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Exterior Service */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Utvändig tjänst</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={pricingData.exteriorService.title}
                            onChange={(e) =>
                              setPricingData({
                                ...pricingData,
                                exteriorService: { ...pricingData.exteriorService, title: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pris (kr)</Label>
                          <Input
                            type="number"
                            value={pricingData.exteriorService.price}
                            onChange={(e) =>
                              setPricingData({
                                ...pricingData,
                                exteriorService: { ...pricingData.exteriorService, price: Number(e.target.value) },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Beskrivning</Label>
                        <Textarea
                          value={pricingData.exteriorService.description}
                          onChange={(e) =>
                            setPricingData({
                              ...pricingData,
                              exteriorService: { ...pricingData.exteriorService, description: e.target.value },
                            })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tillägg (ett per rad: namn,pris)</Label>
                        <Textarea
                          value={pricingData.exteriorService.addons.map(a => `${a.name},${a.price}`).join("\n")}
                          onChange={(e) => {
                            const addons = e.target.value.split("\n").filter(line => line.trim()).map(line => {
                              const [name, price] = line.split(",");
                              return { name: name?.trim() || "", price: Number(price?.trim()) || 0 };
                            });
                            setPricingData({
                              ...pricingData,
                              exteriorService: { ...pricingData.exteriorService, addons },
                            });
                          }}
                          rows={4}
                          placeholder="Asfaltsbortagning,80&#10;Sprayvax,150"
                        />
                      </div>
                    </div>

                    {/* Interior Service */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Invändig tjänst</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titel</Label>
                          <Input
                            value={pricingData.interiorService.title}
                            onChange={(e) =>
                              setPricingData({
                                ...pricingData,
                                interiorService: { ...pricingData.interiorService, title: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pris (kr)</Label>
                          <Input
                            type="number"
                            value={pricingData.interiorService.price}
                            onChange={(e) =>
                              setPricingData({
                                ...pricingData,
                                interiorService: { ...pricingData.interiorService, price: Number(e.target.value) },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Beskrivning</Label>
                        <Textarea
                          value={pricingData.interiorService.description}
                          onChange={(e) =>
                            setPricingData({
                              ...pricingData,
                              interiorService: { ...pricingData.interiorService, description: e.target.value },
                            })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tillägg (ett per rad: namn,pris)</Label>
                        <Textarea
                          value={pricingData.interiorService.addons.map(a => `${a.name},${a.price}`).join("\n")}
                          onChange={(e) => {
                            const addons = e.target.value.split("\n").filter(line => line.trim()).map(line => {
                              const [name, price] = line.split(",");
                              return { name: name?.trim() || "", price: Number(price?.trim()) || 0 };
                            });
                            setPricingData({
                              ...pricingData,
                              interiorService: { ...pricingData.interiorService, addons },
                            });
                          }}
                          rows={4}
                          placeholder="Sätestvätt framstol,250&#10;Sätestvätt baksäte,450"
                        />
                      </div>
                    </div>

                    {/* Combo Services */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Kombinationspaket</h3>
                        <Button variant="outline" size="sm" onClick={addComboService}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {pricingData.comboServices.map((combo, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label>Titel</Label>
                                  <Input
                                    value={combo.title}
                                    onChange={(e) => updateComboService(index, { title: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Pris (text)</Label>
                                  <Input
                                    value={combo.price}
                                    onChange={(e) => updateComboService(index, { price: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Pris (numerisk)</Label>
                                  <Input
                                    type="number"
                                    value={combo.numericPrice}
                                    onChange={(e) => updateComboService(index, { numericPrice: Number(e.target.value) })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Input
                                  value={combo.description}
                                  onChange={(e) => updateComboService(index, { description: e.target.value })}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={combo.popular}
                                  onCheckedChange={(checked) => updateComboService(index, { popular: checked })}
                                />
                                <Label>Populär</Label>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeComboService(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Extra Services */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Övriga tjänster</h3>
                        <Button variant="outline" size="sm" onClick={addExtraService}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {pricingData.extraServices.map((extra, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            value={extra.name}
                            onChange={(e) => updateExtraService(index, { name: e.target.value })}
                            placeholder="Tjänstnamn"
                            className="flex-1"
                          />
                          <Input
                            value={extra.price}
                            onChange={(e) => updateExtraService(index, { price: e.target.value })}
                            placeholder="Pris"
                            className="w-32"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeExtraService(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Note */}
                    <div className="space-y-2 border-b border-border pb-6">
                      <Label htmlFor="pricing-note">OBS-text</Label>
                      <Textarea
                        id="pricing-note"
                        value={pricingData.note}
                        onChange={(e) => setPricingData({ ...pricingData, note: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">CTA-sektion</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pricing-cta-title">Rubrik</Label>
                        <Input
                          id="pricing-cta-title"
                          value={pricingData.ctaTitle}
                          onChange={(e) => setPricingData({ ...pricingData, ctaTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricing-cta-subtitle">Underrubrik</Label>
                        <Input
                          id="pricing-cta-subtitle"
                          value={pricingData.ctaSubtitle}
                          onChange={(e) => setPricingData({ ...pricingData, ctaSubtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricing-cta-button">Knapptext</Label>
                        <Input
                          id="pricing-cta-button"
                          value={pricingData.ctaButtonText}
                          onChange={(e) => setPricingData({ ...pricingData, ctaButtonText: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "pricing", data: pricingData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Priser
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Om oss</CardTitle>
                <CardDescription>
                  Redigera innehållet på Om oss-sidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aboutData && (
                  <>
                    {/* Hero */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Hero-sektion</h3>
                      <div className="space-y-2">
                        <Label htmlFor="about-hero-title">Rubrik</Label>
                        <Input
                          id="about-hero-title"
                          value={aboutData.heroTitle}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, heroTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about-hero-subtitle">Underrubrik</Label>
                        <Textarea
                          id="about-hero-subtitle"
                          value={aboutData.heroSubtitle}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, heroSubtitle: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Story Sections */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Berättelsesektioner</h3>
                        <Button variant="outline" size="sm" onClick={addStorySection}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {aboutData.storySections.map((section, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label>Titel</Label>
                                  <Input
                                    value={section.title}
                                    onChange={(e) => updateStorySection(index, { title: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Ikon</Label>
                                  <select
                                    value={section.icon}
                                    onChange={(e) => updateStorySection(index, { icon: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                  >
                                    {iconOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Textarea
                                  value={section.description}
                                  onChange={(e) => updateStorySection(index, { description: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeStorySection(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Values */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <div className="space-y-2">
                        <Label htmlFor="about-values-title">Värderingars rubrik</Label>
                        <Input
                          id="about-values-title"
                          value={aboutData.valuesTitle}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, valuesTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Värderingar</h3>
                        <Button variant="outline" size="sm" onClick={addValue}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {aboutData.values.map((value, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label>Titel</Label>
                                  <Input
                                    value={value.title}
                                    onChange={(e) => updateValue(index, { title: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Ikon</Label>
                                  <select
                                    value={value.icon}
                                    onChange={(e) => updateValue(index, { icon: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                  >
                                    {iconOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Input
                                  value={value.description}
                                  onChange={(e) => updateValue(index, { description: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeValue(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Hitta oss</h3>
                      <div className="space-y-2">
                        <Label htmlFor="about-location-title">Rubrik</Label>
                        <Input
                          id="about-location-title"
                          value={aboutData.locationTitle}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, locationTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about-location-desc">Beskrivning</Label>
                        <Textarea
                          id="about-location-desc"
                          value={aboutData.locationDescription}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, locationDescription: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Tagline</h3>
                      <div className="space-y-2">
                        <Label htmlFor="about-tagline">Citat</Label>
                        <Input
                          id="about-tagline"
                          value={aboutData.tagline}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, tagline: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about-tagline-author">Författare</Label>
                        <Input
                          id="about-tagline-author"
                          value={aboutData.taglineAuthor}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, taglineAuthor: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "about", data: aboutData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Om oss
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Press Section */}
          <TabsContent value="press">
            <Card>
              <CardHeader>
                <CardTitle>Press</CardTitle>
                <CardDescription>
                  Redigera pressartiklar och kontaktinformation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {pressData && (
                  <>
                    {/* Hero */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <h3 className="font-semibold">Hero-sektion</h3>
                      <div className="space-y-2">
                        <Label htmlFor="press-hero-title">Rubrik</Label>
                        <Input
                          id="press-hero-title"
                          value={pressData.heroTitle}
                          onChange={(e) =>
                            setPressData({ ...pressData, heroTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="press-hero-subtitle">Underrubrik</Label>
                        <Textarea
                          id="press-hero-subtitle"
                          value={pressData.heroSubtitle}
                          onChange={(e) =>
                            setPressData({ ...pressData, heroSubtitle: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Articles */}
                    <div className="space-y-4 border-b border-border pb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Pressartiklar</h3>
                          <div className="space-y-2 mt-2">
                            <Label htmlFor="press-articles-title">Sektionsrubrik</Label>
                            <Input
                              id="press-articles-title"
                              value={pressData.articlesTitle}
                              onChange={(e) =>
                                setPressData({ ...pressData, articlesTitle: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={addPressArticle}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {pressData.articles.map((article) => (
                        <Card key={article.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <Label>Titel</Label>
                                <Input
                                  value={article.title}
                                  onChange={(e) => updatePressArticle(article.id, { title: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label>Källa</Label>
                                  <Input
                                    value={article.source}
                                    onChange={(e) => updatePressArticle(article.id, { source: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Datum (YYYY-MM-DD)</Label>
                                  <Input
                                    value={article.date}
                                    onChange={(e) => updatePressArticle(article.id, { date: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Datum (visas)</Label>
                                  <Input
                                    value={article.dateFormatted}
                                    onChange={(e) => updatePressArticle(article.id, { dateFormatted: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>Beskrivning</Label>
                                <Textarea
                                  value={article.description}
                                  onChange={(e) => updatePressArticle(article.id, { description: e.target.value })}
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>URL</Label>
                                <Input
                                  value={article.url}
                                  onChange={(e) => updatePressArticle(article.id, { url: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removePressArticle(article.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Presskontakt</h3>
                      <div className="space-y-2">
                        <Label htmlFor="press-contact-title">Rubrik</Label>
                        <Input
                          id="press-contact-title"
                          value={pressData.contactTitle}
                          onChange={(e) =>
                            setPressData({ ...pressData, contactTitle: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="press-contact-desc">Beskrivning</Label>
                        <Textarea
                          id="press-contact-desc"
                          value={pressData.contactDescription}
                          onChange={(e) =>
                            setPressData({ ...pressData, contactDescription: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="press-contact-company">Företagsnamn</Label>
                          <Input
                            id="press-contact-company"
                            value={pressData.contactCompany}
                            onChange={(e) =>
                              setPressData({ ...pressData, contactCompany: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="press-contact-email">E-post</Label>
                          <Input
                            id="press-contact-email"
                            value={pressData.contactEmail}
                            onChange={(e) =>
                              setPressData({ ...pressData, contactEmail: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "press", data: pressData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Press
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Section */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Vanliga frågor som visas på landningssidan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {faqData && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="faq-title">Rubrik</Label>
                      <Input
                        id="faq-title"
                        value={faqData.title}
                        onChange={(e) =>
                          setFaqData({ ...faqData, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faq-subtitle">Underrubrik</Label>
                      <Textarea
                        id="faq-subtitle"
                        value={faqData.subtitle}
                        onChange={(e) =>
                          setFaqData({ ...faqData, subtitle: e.target.value })
                        }
                        rows={2}
                      />
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Frågor och svar</h3>
                        <Button variant="outline" size="sm" onClick={addFAQItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till
                        </Button>
                      </div>
                      {faqData.items.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="space-y-1">
                                <Label>Fråga</Label>
                                <Input
                                  value={item.question}
                                  onChange={(e) => updateFAQItem(item.id, { question: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Svar</Label>
                                <Textarea
                                  value={item.answer}
                                  onChange={(e) => updateFAQItem(item.id, { answer: e.target.value })}
                                  rows={3}
                                />
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFAQItem(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "faq", data: faqData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara FAQ
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformation</CardTitle>
                <CardDescription>
                  Central kontaktinfo som används på hela webbplatsen (footer, SEO, kontaktsektioner)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactData && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Företagsinfo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-company">Företagsnamn</Label>
                          <Input
                            id="contact-company"
                            value={contactData.companyName}
                            onChange={(e) =>
                              setContactData({ ...contactData, companyName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Telefon</Label>
                          <Input
                            id="contact-phone"
                            value={contactData.phone}
                            onChange={(e) =>
                              setContactData({ ...contactData, phone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">E-post</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactData.email}
                          onChange={(e) =>
                            setContactData({ ...contactData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Adress</h3>
                      <div className="space-y-2">
                        <Label htmlFor="contact-street">Gatuadress</Label>
                        <Input
                          id="contact-street"
                          value={contactData.address.street}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              address: { ...contactData.address, street: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-city">Ort</Label>
                          <Input
                            id="contact-city"
                            value={contactData.address.city}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                address: { ...contactData.address, city: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-postal">Postnummer</Label>
                          <Input
                            id="contact-postal"
                            value={contactData.address.postalCode}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                address: { ...contactData.address, postalCode: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-region">Län/Region</Label>
                          <Input
                            id="contact-region"
                            value={contactData.address.region}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                address: { ...contactData.address, region: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-country">Land (landskod)</Label>
                          <Input
                            id="contact-country"
                            value={contactData.address.country}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                address: { ...contactData.address, country: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-maps">Google Maps-länk</Label>
                        <Input
                          id="contact-maps"
                          value={contactData.address.mapsUrl}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              address: { ...contactData.address, mapsUrl: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Öppettider</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-weekdays">Vardagar (mån-fre)</Label>
                          <Input
                            id="contact-weekdays"
                            value={contactData.openingHours.weekdays}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                openingHours: { ...contactData.openingHours, weekdays: e.target.value },
                              })
                            }
                            placeholder="10:00 - 19:00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-saturday">Lördag</Label>
                          <Input
                            id="contact-saturday"
                            value={contactData.openingHours.saturday}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                openingHours: { ...contactData.openingHours, saturday: e.target.value },
                              })
                            }
                            placeholder="10:00 - 18:00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-sunday">Söndag</Label>
                          <Input
                            id="contact-sunday"
                            value={contactData.openingHours.sunday}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                openingHours: { ...contactData.openingHours, sunday: e.target.value },
                              })
                            }
                            placeholder="10:00 - 18:00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Sociala medier</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-instagram">Instagram</Label>
                          <Input
                            id="contact-instagram"
                            value={contactData.socialMedia.instagram || ""}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                socialMedia: { ...contactData.socialMedia, instagram: e.target.value },
                              })
                            }
                            placeholder="https://www.instagram.com/carwashap/"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-facebook">Facebook</Label>
                          <Input
                            id="contact-facebook"
                            value={contactData.socialMedia.facebook || ""}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                socialMedia: { ...contactData.socialMedia, facebook: e.target.value },
                              })
                            }
                            placeholder="https://www.facebook.com/carwashap"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-linkedin">LinkedIn</Label>
                          <Input
                            id="contact-linkedin"
                            value={contactData.socialMedia.linkedin || ""}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                socialMedia: { ...contactData.socialMedia, linkedin: e.target.value },
                              })
                            }
                            placeholder="https://www.linkedin.com/company/carwashap"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact-tiktok">TikTok</Label>
                          <Input
                            id="contact-tiktok"
                            value={contactData.socialMedia.tiktok || ""}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                socialMedia: { ...contactData.socialMedia, tiktok: e.target.value },
                              })
                            }
                            placeholder="https://www.tiktok.com/@carwashap"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Footer</h3>
                      <div className="space-y-2">
                        <Label htmlFor="contact-tagline">Tagline (visas i footern)</Label>
                        <Input
                          id="contact-tagline"
                          value={contactData.footerTagline || ""}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              footerTagline: e.target.value,
                            })
                          }
                          placeholder="Smart care for your car. More time for you."
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Egna länkar i footern</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newLink: FooterLink = { label: "Ny länk", url: "/" };
                              setContactData({
                                ...contactData,
                                footerLinks: [...(contactData.footerLinks || []), newLink],
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Lägg till
                          </Button>
                        </div>
                        {(contactData.footerLinks || []).map((link, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={link.label}
                              onChange={(e) => {
                                const updated = [...(contactData.footerLinks || [])];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setContactData({ ...contactData, footerLinks: updated });
                              }}
                              placeholder="Länktext"
                              className="flex-1"
                            />
                            <Input
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...(contactData.footerLinks || [])];
                                updated[idx] = { ...updated[idx], url: e.target.value };
                                setContactData({ ...contactData, footerLinks: updated });
                              }}
                              placeholder="/sida eller https://..."
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = (contactData.footerLinks || []).filter((_, i) => i !== idx);
                                setContactData({ ...contactData, footerLinks: updated });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        saveMutation.mutate({ section: "contact", data: contactData })
                      }
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Spara Kontaktinfo & Footer
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Sideditor</h1>
            <p className="text-muted-foreground">Redigera innehållet på webbplatsen</p>
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "editor" | "split" | "preview")}>
            <ToggleGroupItem value="editor" aria-label="Endast editor" title="Endast editor">
              <PanelLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="split" aria-label="Split view" title="Split view">
              <Columns2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="preview" aria-label="Endast preview" title="Endast preview">
              <Eye className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {viewMode === "preview" ? (
          <div className="h-[calc(100vh-180px)] border rounded-lg overflow-hidden">
            <SectionPreview
              activeTab={activeTab}
              heroData={heroData}
              servicesData={servicesData}
              benefitsData={benefitsData}
              ctaData={ctaData}
              faqData={faqData}
              pricingData={pricingData}
              aboutData={aboutData}
              pressData={pressData}
              contactData={contactData}
            />
          </div>
        ) : viewMode === "split" ? (
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-180px)] border rounded-lg">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-auto p-4">
                {renderEditorContent()}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <SectionPreview
                activeTab={activeTab}
                heroData={heroData}
                servicesData={servicesData}
                benefitsData={benefitsData}
                ctaData={ctaData}
                faqData={faqData}
                pricingData={pricingData}
                aboutData={aboutData}
                pressData={pressData}
                contactData={contactData}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="max-w-5xl mx-auto">
            {renderEditorContent()}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandingCMS;
