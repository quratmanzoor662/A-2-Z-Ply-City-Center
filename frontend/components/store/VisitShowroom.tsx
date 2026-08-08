"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock3, MessageCircle } from "lucide-react";
import type { StoreSettings } from "@/lib/types";

export function VisitShowroom({ settings }: { settings: StoreSettings }) {
  const mapsHref = settings.mapsUrl || "https://maps.app.goo.gl/c5Zgd6MzRepAdHMb6";
  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section id="contact" className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(196,154,108,0.18),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(110,139,94,0.16),transparent_50%)]" />

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Visit us</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Contact & Showroom</h2>
          <p className="mt-3 text-sm text-muted md:text-base">
            Drop by for samples, or message us for a quick quote.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="relative overflow-hidden rounded-[1.75rem] bg-white p-6 shadow-[0_20px_60px_rgba(45,45,45,0.06)] md:p-8"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-accent/15 blur-2xl" />

            <div className="relative space-y-5">
              <InfoRow icon={<MapPin className="h-5 w-5" />} label="Address" value={settings.address} />
              <InfoRow icon={<Clock3 className="h-5 w-5" />} label="Hours" value={settings.openingHours} />
              <InfoRow icon={<MessageCircle className="h-5 w-5" />} label="Phone" value={settings.phone} />
              <InfoRow icon={<Navigation className="h-5 w-5" />} label="Email" value={settings.email} />

              <div className="flex flex-wrap gap-3 pt-2">
                <a href={waHref} target="_blank" rel="noreferrer" className="btn btn-accent">
                  WhatsApp Us
                </a>
                <a href={mapsHref} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  Open Maps
                </a>
              </div>
            </div>
          </motion.div>

          <motion.a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.12 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group relative block min-h-[320px] overflow-hidden rounded-[1.75rem] bg-[#2a3326] text-white md:min-h-[380px]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(110,139,94,0.35),transparent_40%),linear-gradient(320deg,rgba(196,154,108,0.28),transparent_45%)]" />
            <GrainPattern />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <motion.span
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-4 rounded-full border border-accent/50"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.1, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
                />
                <motion.div
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-[#2d2d2d] shadow-lg"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MapPin className="h-7 w-7" />
                </motion.div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <p className="font-display text-2xl font-semibold md:text-3xl">Find the showroom</p>
                <p className="mt-2 max-w-sm text-sm text-white/80">
                  Tap to open directions in Google Maps — samples and expert advice waiting for you.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition group-hover:gap-3">
                  Get directions
                  <Navigation className="h-4 w-4" />
                </span>
              </motion.div>
            </div>

            <FloatingChips />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-ink md:text-base">{value}</p>
      </div>
    </div>
  );
}

function GrainPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0.6px, transparent 0.8px), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.25) 0.5px, transparent 0.7px)",
        backgroundSize: "18px 18px, 26px 26px",
      }}
    />
  );
}

function FloatingChips() {
  const chips = [
    { label: "Plywood", x: "12%", y: "18%", delay: 0 },
    { label: "Laminates", x: "68%", y: "22%", delay: 0.4 },
    { label: "Hardware", x: "74%", y: "58%", delay: 0.8 },
  ];

  return (
    <>
      {chips.map((chip) => (
        <motion.span
          key={chip.label}
          className="pointer-events-none absolute rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm"
          style={{ left: chip.x, top: chip.y }}
          animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
        >
          {chip.label}
        </motion.span>
      ))}
    </>
  );
}
