"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useApplyAsCreator } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  wallet: z.string().min(32, "Enter a valid Solana wallet address"),
  name: z.string().min(2, "Name is required"),
  organization: z.string().min(2, "Organization name is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  email: z.string().email("Valid email required"),
  website: z.string().url("Enter a valid URL (include https://)").optional().or(z.literal("")),
  pastEvents: z.string().optional(),
  expectedUse: z.string().min(20, "Please describe your planned use (min 20 chars)"),
});

type FormData = z.infer<typeof schema>;

export default function CreatorApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const apply = useApplyAsCreator();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      wallet: "", name: "", organization: "", country: "", city: "",
      email: "", website: "", pastEvents: "", expectedUse: "",
    },
  });

  function onSubmit(data: FormData) {
    apply.mutate(
      { data: { ...data, website: data.website || undefined } },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? "Application failed. Please try again.";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md" data-testid="div-success">
          <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Application Received!</h2>
          <p className="text-white/50 text-sm mb-6">
            Your creator application has been submitted. The DaddyX team will review it within 2–3 business days.
            You can check your status using your wallet address.
          </p>
          <Button
            onClick={() => window.location.href = "/creator/status"}
            className="gradient-red border-0"
            data-testid="button-check-status"
          >
            Check Application Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Apply as a Creator</h1>
          <p className="text-white/50 text-sm">
            Become a DaddyX-approved event organizer. List events with token-based fan financing on Solana.
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-white/70 text-xs">Solana Wallet Address *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your Solana wallet address" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-wallet" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">Your Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full name" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">Organization *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Company or event brand" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-organization" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">Country *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Kenya" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">City *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Nairobi" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="you@example.com" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-xs">Website (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourwebsite.com" className="bg-white/4 border-white/12 text-white placeholder:text-white/25" data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pastEvents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">Past Events (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="List any past events you've organized..." rows={3} className="bg-white/4 border-white/12 text-white placeholder:text-white/25 resize-none" data-testid="textarea-past-events" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70 text-xs">How will you use DaddyX? *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Describe the type of events you plan to run, expected audience size, and how fan financing fits your model..." rows={4} className="bg-white/4 border-white/12 text-white placeholder:text-white/25 resize-none" data-testid="textarea-expected-use" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full gradient-red border-0 glow-red font-semibold h-11"
                disabled={apply.isPending}
                data-testid="button-submit-application"
              >
                {apply.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
