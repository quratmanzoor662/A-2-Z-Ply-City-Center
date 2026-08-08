"use client";

import Image from "next/image";
import Link from "next/link";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners, brand }: { banners: Banner[]; brand: string }) {
  const slides =
    banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            title: brand,
            subtitle: "Premium plywood & hardware for dream interiors",
            buttonText: "Explore Catalog",
            buttonLink: "/products",
            desktopImage: {
              url: "https://images.unsplash.com/photo-1615874959471-d35aa6e2f0a7?w=1600&q=80",
            },
            mobileImage: {
              url: "https://images.unsplash.com/photo-1615874959471-d35aa6e2f0a7?w=900&q=80",
            },
            sortOrder: 0,
            active: true,
          } as Banner,
        ];

  return (
    <section className="relative w-full max-w-[100vw] overflow-hidden bg-[#1c1c1c]">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={
          slides.length > 1
            ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={slides.length > 1 ? { clickable: true } : false}
        loop={false}
        rewind={slides.length > 1}
        allowTouchMove={slides.length > 1}
        watchSlidesProgress
        className="hero-swiper h-[70svh] w-full sm:h-[80svh] md:h-[100svh]"
      >
        {slides.map((banner, index) => {
          const desktop = banner.desktopImage?.url || "";
          const mobile = banner.mobileImage?.url || desktop;
          return (
            <SwiperSlide key={banner.id || `banner-${index}`}>
              <div className="hero-slide relative h-[70svh] w-full overflow-hidden bg-[#1c1c1c] sm:h-[80svh] md:h-[100svh]">
                {desktop && (
                  <>
                    <Image
                      src={desktop}
                      alt={banner.title || brand}
                      fill
                      priority={index === 0}
                      className="hero-slide-image hidden object-cover md:block"
                      sizes="100vw"
                    />
                    <Image
                      src={mobile}
                      alt={banner.title || brand}
                      fill
                      priority={index === 0}
                      className="hero-slide-image object-cover md:hidden"
                      sizes="100vw"
                    />
                  </>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/25" />
                <div className="absolute inset-0 flex items-end pb-16 sm:pb-20 md:items-center md:pb-0">
                  <div className="hero-copy container-page w-full text-white">
                    <p className="font-display max-w-[16ch] text-[1.85rem] font-semibold leading-[1.15] sm:max-w-none sm:text-4xl md:text-6xl lg:text-7xl">
                      {banner.title || brand}
                    </p>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:mt-4 sm:text-base md:max-w-xl md:text-lg">
                      {banner.subtitle}
                    </p>
                    {banner.buttonText && (
                      <div className="mt-6 sm:mt-8">
                        <Link href={banner.buttonLink || "/products"} className="btn btn-primary">
                          {banner.buttonText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
