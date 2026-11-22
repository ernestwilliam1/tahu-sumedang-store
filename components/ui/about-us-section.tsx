"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  Wheat,
  Flame,
  Leaf,
  Soup,
  ChefHat,
  Award,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"

// Design tokens — TahuSumedang-ArtisanalLight (shopify.DESIGN.md)
const cardShadow = "0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)"
const cardShadowHover = "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

const PILLARS = [
  {
    icon: Wheat,
    title: "Kedelai Pilihan",
    description:
      "Kedelai non-GMO pilihan, direndam cukup waktu dan digiling segar setiap pagi di dapur gerai.",
  },
  {
    icon: Flame,
    title: "Goreng Dadakan",
    description:
      "Digoreng hanya saat pesanan masuk. Tahu yang didiamkan kehilangan renyahnya — itu sebabnya kami tidak menggoreng stok awal.",
  },
  {
    icon: Leaf,
    title: "Minyak Higienis",
    description:
      "Minyak diganti berkala dan tidak pernah dipakai berulang hingga menghitam. Standar dapur yang dapat diaudit.",
  },
  {
    icon: Soup,
    title: "Sambal Diracik Harian",
    description:
      "Sambal kecap dan cabai rawit hijau diracik segar setiap hari mengikuti resep keluarga.",
  },
  {
    icon: ChefHat,
    title: "Dapur Bersih",
    description:
      "Setiap batch melewati pemeriksaan suhu dan kebersihan. Peralatan disanitasi di antara sesi produksi.",
  },
  {
    icon: Award,
    title: "Resep Warisan",
    description:
      "Satu resep, satu tekstur: renyah di luar, lembut kopong di dalam, dijaga konsisten sejak gerai pertama.",
  },
]

const STATS = [
  { icon: Award, value: 46, suffix: "", label: "Tahun Pengalaman" },
  { icon: Users, value: 1200, suffix: "+", label: "Pelanggan Setia" },
  { icon: Calendar, value: 2400, suffix: "+", label: "Pesanan per Bulan" },
  { icon: TrendingUp, value: 98, suffix: "%", label: "Tingkat Kepuasan" },
]

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.1 })
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })

  const left = PILLARS.slice(0, 3)
  const right = PILLARS.slice(3)

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="w-full bg-[#FAF9F6] text-[#1C1917] py-16 sm:py-24 px-6 sm:px-8"
    >
      <div className="max-w-[1260px] mx-auto">
        {/* Header */}
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold tracking-[0.12em] uppercase">
            Warisan Kuliner Priangan
          </span>
          <h2 className="mt-4 text-[28px] sm:text-[32px] font-semibold leading-[1.25]">
            Tentang Tahu Sumedang
          </h2>
          <p className="mt-3 text-[15px] sm:text-base text-[#78716C] leading-[1.6]">
            Kami bukan sekadar menjual tahu. Kami menjaga satu resep keluarga, satu tekstur khas
            Priangan, dan satu janji — renyah di luar, lembut kopong di dalam, disajikan hangat setiap
            saat.
          </p>
        </motion.div>

        {/* Three-column body */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="space-y-8 order-2 lg:order-1">
            {left.map((p, i) => (
              <Pillar key={p.title} {...p} delay={i * 0.08} />
            ))}
          </div>

          {/* Center image card */}
          <motion.div
            className="order-1 lg:order-2"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            <div
              className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden"
              style={{ boxShadow: cardShadow }}
            >
              <div className="aspect-[4/5] bg-[#F3F1ED] overflow-hidden">
                <img
                  src={encodeURI("/images/Tahu Sumedang Besek Tradisional.jpg")}
                  alt="Tahu Sumedang dalam besek tradisional, digoreng dadakan"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[13px] font-medium text-[#78716C] tracking-[0.08em] uppercase">
                  Besek Tradisional
                </p>
                <p className="mt-1.5 text-[15px] text-[#1C1917] leading-[1.6]">
                  Setiap besek disiapkan ketika Anda memesan — tidak pernah digoreng lebih awal.
                </p>
                <a
                  href="/katalog"
                  className="mt-4 inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-[#1C1917] text-white text-[15px] font-medium hover:bg-[#292524] active:bg-[#44403C] transition-colors"
                >
                  Lihat Katalog
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8 order-3">
            {right.map((p, i) => (
              <Pillar key={p.title} {...p} delay={i * 0.08} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {STATS.map((s, i) => (
            <StatCounter
              key={s.label}
              icon={s.icon}
              value={s.value}
              suffix={s.suffix}
              label={s.label}
              delay={i * 0.06}
              animate={statsInView}
            />
          ))}
        </div>

        {/* CTA — cream container per design doc, not a dark block */}
        <motion.div
          className="mt-12 sm:mt-16 bg-[#F3F1ED] border border-[#E7E5E4] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div>
            <h3 className="text-[20px] sm:text-[24px] font-semibold leading-[1.3]">
              Siap mencoba tahu yang baru digoreng?
            </h3>
            <p className="mt-1.5 text-sm text-[#78716C] leading-[1.6]">
              Stok real-time, harga transparan, diantar hangat ke pintu Anda.
            </p>
          </div>
          <a
            href="/katalog"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#D97706] text-white text-[15px] font-medium hover:bg-[#B45309] active:bg-[#92400E] transition-colors shrink-0"
          >
            Pesan Sekarang
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function Pillar({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      transition={{ delay }}
    >
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 shrink-0 rounded-lg bg-[#F3F1ED] border border-[#E7E5E4] text-[#D97706] flex items-center justify-center">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <h3 className="text-[16px] font-semibold text-[#1C1917] leading-[1.4]">{title}</h3>
      </div>
      <p className="mt-2.5 text-sm text-[#78716C] leading-[1.6]" style={{ paddingLeft: 52 }}>
        {description}
      </p>
    </motion.div>
  )
}

function StatCounter({
  icon: Icon,
  value,
  suffix,
  label,
  delay,
  animate,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  suffix: string
  label: string
  delay: number
  animate: boolean
}) {
  const spring = useSpring(0, { stiffness: 60, damping: 14 })
  const [started, setStarted] = useState(false)
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString("id-ID"))

  useEffect(() => {
    if (animate && !started) {
      spring.set(value)
      setStarted(true)
    }
  }, [animate, started, spring, value])

  return (
    <motion.div
      className="bg-white border border-[#E5E2DC] rounded-xl p-5 sm:p-6"
      style={{ boxShadow: cardShadow }}
      initial={{ opacity: 0, y: 12 }}
      animate={animate ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ boxShadow: cardShadowHover }}
    >
      <span className="w-9 h-9 rounded-lg bg-[#F3F1ED] text-[#78716C] flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </span>
      <span className="block mt-4 text-[24px] sm:text-[28px] font-semibold text-[#1C1917] tabular-nums leading-none">
        <motion.span>{display}</motion.span>
        {suffix}
      </span>
      <span className="block mt-1.5 text-[13px] text-[#78716C] leading-[1.5]">{label}</span>
    </motion.div>
  )
}
