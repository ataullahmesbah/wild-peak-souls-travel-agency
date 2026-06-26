'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Reveal } from '@/components/layout/reveal';

export function HomeNewsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mountain-700 via-forest-700 to-ocean-800 px-6 py-12 text-center sm:px-12 lg:py-16">
            <div className="absolute inset-0 bg-mesh opacity-20" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-white text-balance sm:text-3xl">
                Get Adventure Updates in Your Inbox
              </h2>
              <p className="mt-3 text-white/80">
                Subscribe to receive exclusive deals, trip guides, and event announcements.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {submitted ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <CheckCircle className="h-5 w-5" />
                    <span>You are subscribed! Welcome to the adventure.</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-11 rounded-lg border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md focus:ring-1 focus:ring-white/40"
                    />
                    <Button
                      onClick={() => setSubmitted(true)}
                      className="h-11 gap-2 bg-white text-primary hover:bg-white/90"
                    >
                      <Send className="h-4 w-4" />
                      Subscribe
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
