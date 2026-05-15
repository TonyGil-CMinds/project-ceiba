"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import IntroTransition from "./components/IntroTransition";
import WaterBackground from "./components/WaterBackground";

const TARGET_DATE = new Date("2026-10-05T00:00:00-06:00").getTime();
const AUDIO_SRC = "/images/Mi%20Tierra,%20Tu%20Tierra%20.mp3";

function getRemainingTime() {
  const difference = Math.max(0, TARGET_DATE - Date.now());

  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function OdometerDigit({ digit }) {
  const numbers = useMemo(() => Array.from({ length: 10 }, (_, index) => index), []);

  return (
    <span className="odometer-digit" aria-hidden="true">
      <span
        className="odometer-strip"
        style={{ transform: `translate3d(0, -${Number(digit) * 10}%, 0)` }}
      >
        {numbers.map((number) => (
          <span className="odometer-number" key={number}>
            {number}
          </span>
        ))}
      </span>
    </span>
  );
}

function OdometerValue({ value, digits }) {
  const formattedValue = String(value).padStart(digits, "0");

  return (
    <span className="odometer-value" aria-label={String(value)}>
      {formattedValue.split("").map((digit, index) => (
        <OdometerDigit digit={digit} key={`${digits}-${index}`} />
      ))}
    </span>
  );
}

export default function Home() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [audioReady, setAudioReady] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [odometerRevealed, setOdometerRevealed] = useState([false, false, false, false]);
  const audioRef = useRef(null);
  const heroRef = useRef(null);
  const logoRef = useRef(null);
  const countdownRef = useRef(null);
  const footerRef = useRef(null);
  const partnerRefs = useRef([]);

  const completeIntro = useCallback(() => {
    setIntroDone(true);
  }, []);

  useEffect(() => {
    setTime(getRemainingTime());
    const interval = window.setInterval(() => {
      setTime(getRemainingTime());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    import("@barba/core").then(({ default: barba }) => {
      if (!isMounted || window.__ceibaBarbaReady) return;

      barba.init({
        preventRunning: true,
        transitions: [
          {
            name: "ceiba-fade",
            leave({ current }) {
              return gsap.to(current.container, {
                autoAlpha: 0,
                duration: 0.45,
                ease: "power2.inOut",
              });
            },
            enter({ next }) {
              return gsap.from(next.container, {
                autoAlpha: 0,
                duration: 0.55,
                ease: "power2.out",
              });
            },
          },
        ],
      });

      window.__ceibaBarbaReady = true;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!introDone) return undefined;

    const ctx = gsap.context(() => {
      gsap.set(countdownRef.current, { autoAlpha: 0, y: 28 });
      gsap.set(footerRef.current, { autoAlpha: 0, y: 18 });
      gsap.set(partnerRefs.current, { autoAlpha: 0, y: 14, filter: "blur(6px)" });

      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 0.25 })
        .to(countdownRef.current, { autoAlpha: 1, y: 0, duration: 0.95 })
        .call(() => {
          // Cascade: reveal each unit's real value with stagger so the CSS
          // transition on each odometer strip fires unit by unit
          [0, 1, 2, 3].forEach((i) => {
            gsap.delayedCall(i * 0.18, () => {
              setOdometerRevealed((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            });
          });
        })
        .to(footerRef.current, { autoAlpha: 1, y: 0, duration: 0.75 }, "-=0.4")
        .to(
          partnerRefs.current,
          { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.15, duration: 0.7 },
          "-=0.55"
        );
    }, heroRef);

    return () => ctx.revert();
  }, [introDone]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.42;
    const playAttempt = audio.play();

    if (playAttempt) {
      playAttempt.catch(() => {
        setAudioReady(false);
      });
    }
  }, []);

  const activateAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => setAudioReady(true))
      .catch(() => setAudioReady(false));
  };

  const countdownItems = [
    { label: "DIAS", value: time.days, digits: 3 },
    { label: "HORAS", value: time.hours, digits: 2 },
    { label: "MINUTOS", value: time.minutes, digits: 2 },
    { label: "SEGUNDOS", value: time.seconds, digits: 2 },
  ];

  const partners = [
    { src: "/images/logo-naturatech.svg", alt: "NaturaTech LAC" },
    { src: "/images/logo-cminds.svg", alt: "C Minds" },
    { src: "/images/logo-bidlab.svg", alt: "BID Lab" },
  ];

  return (
    <main className="ceiba-page" data-barba="wrapper">
      <section className="ceiba-hero" ref={heroRef} data-barba="container" data-barba-namespace="home">
        <WaterBackground src="/images/bg.png" />
        <div className="ceiba-vignette" aria-hidden="true" />
        {!introDone && <IntroTransition onComplete={completeIntro} targetRef={logoRef} />}

        <audio ref={audioRef} src={AUDIO_SRC} loop autoPlay playsInline preload="auto" />

        <div className="ceiba-content">
          <img
            className="ceiba-logo"
            ref={logoRef}
            src="/images/logo.svg"
            alt="Ceiba"
          />

          <div className="countdown" ref={countdownRef}>
            {countdownItems.map((item, index) => (
              <div className="countdown-item" key={item.label}>
                <OdometerValue
                  value={odometerRevealed[index] ? item.value : 0}
                  digits={item.digits}
                />
                <span className="countdown-label">{item.label}</span>
              </div>
            ))}
          </div>

          <footer className="hero-footer" ref={footerRef}>
            <span className="presented">PRESENTADO POR</span>
            <div className="partner-logos">
              {partners.map((partner, index) => (
                <img
                  alt={partner.alt}
                  className="partner-logo"
                  key={partner.src}
                  ref={(element) => {
                    partnerRefs.current[index] = element;
                  }}
                  src={partner.src}
                />
              ))}
            </div>
            <p className="copyright">&copy; 2026 Todos los derechos reservados. NaturaTech LAC.</p>
          </footer>
        </div>

        {!audioReady && (
          <button className="audio-button" onClick={activateAudio} type="button">
            Activar audio
          </button>
        )}
      </section>
    </main>
  );
}
