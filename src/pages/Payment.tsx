
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Mail, MessageCircle, Star } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  daily_limit: number;
  features: string[];
  active: boolean;
}

interface ContactInfo {
  email: string;
  whatsapp: string;
  payment_instructions: string;
}

const Payment = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'legendgamerz9999@gmail.com',
    whatsapp: '',
    payment_instructions: 'Contact us for manual payment processing.'
  });

  useEffect(() => {
    loadPricingPlans();
    loadContactInfo();
  }, []);

  const loadPricingPlans = async () => {
    try {
      // Mock data - replace with actual Supabase call when database is set up
      const mockPlans = [
        { id: '1', name: 'Free', price: 0, daily_limit: 1, features: ['1 transcript per day', 'Basic support'], active: true },
        { id: '2', name: 'Basic', price: 1, daily_limit: 5, features: ['5 transcripts per day', 'Email support'], active: true },
        { id: '3', name: 'Pro', price: 2, daily_limit: 10, features: ['10 transcripts per day', 'Priority support', 'Analysis features'], active: true },
        { id: '4', name: 'Premium', price: 3, daily_limit: 20, features: ['20 transcripts per day', 'Premium support', 'All features'], active: true }
      ];
      
      setPlans(mockPlans);
    } catch (error) {
      console.error('Error loading pricing plans:', error);
    }
  };

  const loadContactInfo = async () => {
    try {
      // Mock data - replace with actual Supabase call when database is set up
      const mockContactInfo = {
        email: 'legendgamerz9999@gmail.com',
        whatsapp: '',
        payment_instructions: 'Contact us for manual payment processing.'
      };
      
      setContactInfo(mockContactInfo);
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  };

  const handleContactEmail = () => {
    window.location.href = `mailto:${contactInfo.email}?subject=Upgrade Request&body=Hello, I would like to upgrade my plan.`;
  };

  const handleContactWhatsApp = () => {
    if (contactInfo.whatsapp) {
      window.open(contactInfo.whatsapp, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 premium-gradient bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI transcription with our flexible pricing plans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card key={plan.id} className={`relative border-2 ${
              plan.name === 'Premium' 
                ? 'border-yellow-500 shadow-2xl scale-105' 
                : plan.name === 'Pro'
                ? 'border-blue-500 shadow-lg'
                : 'border-primary/20 shadow-md'
            }`}>
              {plan.name === 'Premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-black px-3 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.name === 'Premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                  {plan.name === 'Pro' && <Star className="h-5 w-5 text-blue-500" />}
                </CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.daily_limit} transcripts per day
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.name === 'Free' 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : plan.name === 'Premium'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                      : ''
                  }`}
                  onClick={plan.name === 'Free' ? undefined : handleContactEmail}
                  disabled={plan.name === 'Free'}
                >
                  {plan.name === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Ready to Upgrade?</CardTitle>
            <p className="text-center text-muted-foreground">
              Contact us to upgrade your plan manually
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <p className="text-center mb-4">{contactInfo.payment_instructions}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="flex items-center gap-2"
                onClick={handleContactEmail}
              >
                <Mail className="h-5 w-5" />
                Email Us: {contactInfo.email}
              </Button>
              
              {contactInfo.whatsapp && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleContactWhatsApp}
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Payment is processed manually. You'll receive confirmation within 24 hours.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
