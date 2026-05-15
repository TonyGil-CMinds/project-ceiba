"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function IntroTransition({ onComplete, targetRef }) {
  const overlayRef = useRef(null);
  const backdropLeftRef = useRef(null);
  const backdropRightRef = useRef(null);
  const logoRef = useRef(null);
  const lineRefs = useRef([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const backdropLeft = backdropLeftRef.current;
    const backdropRight = backdropRightRef.current;
    const logo = logoRef.current;
    const target = targetRef.current;

    if (!overlay || !backdropLeft || !backdropRight || !logo || !target) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(target, { autoAlpha: 1 });
      onComplete?.();
      return undefined;
    }

    gsap.set(target, { autoAlpha: 0 });
    // Panels start fully visible; clip-path set so GSAP can interpolate the format
    gsap.set(backdropLeft, { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(backdropRight, { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(lineRefs.current, {
      autoAlpha: 0,
      yPercent: 130,
      rotate: 0,
      transformOrigin: "50% 100%",
    });

    const moveLogoToHero = () => {
      const logoBox = logo.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();
      const logoCenter = {
        x: logoBox.left + logoBox.width / 2,
        y: logoBox.top + logoBox.height / 2,
      };
      const targetCenter = {
        x: targetBox.left + targetBox.width / 2,
        y: targetBox.top + targetBox.height / 2,
      };

      return gsap.to(logo, {
        x: targetCenter.x - logoCenter.x,
        y: targetCenter.y - logoCenter.y,
        scale: targetBox.width / logoBox.width,
        rotationX: 0,
        rotate: 0,
        duration: 1.85,
        ease: "power3.inOut",
      });
    };

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          if (completedRef.current) return;
          completedRef.current = true;
          onComplete?.();
        },
      });

      timeline
        .set(logo, {
          transformPerspective: 900,
          transformOrigin: "50% 50%",
          rotationX: -540,
          rotate: -24,
        })
        .fromTo(
          logo,
          { autoAlpha: 0, scale: 0.28, y: 24 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.86,
            ease: "elastic.out(1, 0.58)",
          }
        )
        .to(
          logo,
          {
            rotationX: 0,
            rotate: 360,
            duration: 1.05,
            ease: "back.out(1.25)",
          },
          "-=0.62"
        )
        .to(
          lineRefs.current,
          {
            autoAlpha: 1,
            yPercent: 0,
            stagger: 0.1,
            duration: 0.78,
            ease: "power4.out",
          },
          "-=0.1"
        )
        // Lines open like scissors while backdrop panels slide out as curtains,
        // revealing the background from the center gap between the lines
        .to(
          lineRefs.current,
          {
            rotate: (index) => (index === 0 ? -78 : 78),
            xPercent: (index) => (index === 0 ? -16 : 16),
            duration: 0.95,
            ease: "power3.inOut",
          },
          "+=0.08"
        )
        .to(backdropLeft, { clipPath: "inset(0% 100% 0% 0%)", duration: 1.05, ease: "power2.inOut" }, "<")
        .to(backdropRight, { clipPath: "inset(0% 0% 0% 100%)", duration: 1.05, ease: "power2.inOut" }, "<")
        // Logo starts moving to hero position shortly after curtains begin opening
        .add("logoMove", "<+=0.05")
        .add(moveLogoToHero, "logoMove")
        // Lines fade out while logo is in transit
        .to(lineRefs.current, { autoAlpha: 0, duration: 0.55, ease: "power2.out" }, "logoMove+=0.3")
        // The moment the logo arrives: reveal the real hero logo, then fade the overlay
        .set(target, { autoAlpha: 1 }, "logoMove+=1.85")
        .to(overlay, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, "logoMove+=1.85");
    }, overlay);

    return () => {
      if (!completedRef.current) {
        ctx.revert();
      }
    };
  }, [onComplete, targetRef]);

  return (
    <div className="intro-transition" ref={overlayRef} aria-hidden="true">
      <div className="intro-backdrop-left" ref={backdropLeftRef} />
      <div className="intro-backdrop-right" ref={backdropRightRef} />

      <div
        className="intro-line intro-line-left"
        ref={(element) => {
          lineRefs.current[0] = element;
        }}
      />
      <div
        className="intro-line intro-line-right"
        ref={(element) => {
          lineRefs.current[1] = element;
        }}
      />

      <img className="intro-logo" ref={logoRef} src="/images/logo.svg" alt="" />
    </div>
  );
}
