"use client"
import { motion } from "framer-motion"
import { Zap, Shield, Rocket, ArrowRight, Gauge } from "lucide-react"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const features = [
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Instant GitHub events delivered to Discord without delay",
    },
    {
      icon: Gauge,
      title: "Live Monitoring",
      description: "Track repositories, issues and PRs in your Discord server",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "OAuth 2.0 verified with signed webhooks and encryption",
    },
    {
      icon: Rocket,
      title: "Deploy Instantly",
      description: "One-click setup on Vercel with environment configuration",
    },
  ]

  const stats = [
    { number: "2.5k+", label: "Active Users" },
    { number: "50k+", label: "Events/Day" },
    { number: "99.9%", label: "Uptime" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-border/10 backdrop-blur-xl bg-background/40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-xl blur opacity-75" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Opscord
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <motion.div className="text-center space-y-10" variants={containerVariants} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full border border-accent/30 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-md hover:border-accent/50 transition-colors duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GitHub × Discord Integration
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-tight">
              <span className="block text-foreground">Monitor GitHub</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                in Discord
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed"
          >
            Real-time GitHub notifications delivered to your Discord server. Track repositories, issues, PRs, and
            deployments without leaving chat.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button className="group relative px-8 py-3.5 rounded-lg overflow-hidden font-semibold text-base transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative inline-flex items-center text-white gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-3.5 rounded-lg border border-accent/50 text-foreground font-semibold hover:bg-accent/5 hover:border-accent transition-all duration-300 backdrop-blur-sm">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-4 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:border-accent/50 transition-colors"
                whileHover={{ y: -5 }}
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to seamlessly integrate GitHub and Discord
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card/50 to-background/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 overflow-hidden"
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="p-8 sm:p-12 rounded-2xl border border-accent/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-accent/10 to-primary/0 opacity-50" />
          <div className="relative space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join developers who are already monitoring their projects in Discord. Start free, no credit card needed.
            </p>
            <button className="group relative px-8 py-3.5 rounded-lg overflow-hidden font-semibold text-base transition-all duration-300 mx-auto block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
              <span className="relative inline-flex items-center text-white gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/10 mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Opscord. Built for developers who care about their workflow.</p>
        </div>
      </footer>
    </div>
  )
}
