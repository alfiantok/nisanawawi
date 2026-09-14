/* ==========================================================================
   THE WEDDING OF ANNISA & NAWAWI - JAVASCRIPT LOGIC & 3D ANIMATIONS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Check GSAP and register ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Initial Card Entrance Animation
  gsap.from(".card", {
    opacity: 0,
    y: 40,
    scale: 0.94,
    duration: 1.2,
    ease: "power3.out",
  });

  gsap.from(".envelope-wrapper", {
    scale: 0.82,
    opacity: 0,
    duration: 1.2,
    delay: 0.2,
    ease: "back.out(1.4)",
  });

  // Falling Petals / Emoticons Generator (Customizable by Theme, 50% Gentler Intensity)
  const themeIcons = {
    default: ["🌸", "🌺", "🌼", "💮", "✨", "🍃"],
    pink: ["🌸", "🌷", "🌺", "💮", "✨", "💖"],
    biru: ["💠", "❄️", "✨", "💎", "💙", "🌊"],
    coklat: ["🍂", "🍁", "✨", "🌾", "🤎", "🍃"],
    kuning: ["🌻", "🌼", "✨", "💛", "⭐", "🍯"]
  };
  let currentTheme = localStorage.getItem("wedding_theme") || "default";
  let icons = themeIcons[currentTheme] || themeIcons.default;
  const flowers = document.getElementById("flowers");
  let flowerInterval = null;

  function createFlower() {
    if (!flowers) return;
    const flower = document.createElement("div");
    flower.className = "flower";
    flower.textContent = icons[Math.floor(Math.random() * icons.length)];
    flower.style.left = `${Math.random() * 100}vw`;
    flower.style.animationDuration = `${6 + Math.random() * 6}s`;
    flower.style.fontSize = `${15 + Math.random() * 12}px`;
    flowers.appendChild(flower);

    window.setTimeout(() => flower.remove(), 12000);
  }

  // 50% gentler intensity: 650ms instead of 300ms
  flowerInterval = window.setInterval(createFlower, 650);

  // Background Stars Generator for Hero Scene
  const starsContainer = document.querySelector(".stars");
  if (starsContainer) {
    for (let i = 0; i < 90; i += 1) {
      const star = document.createElement("span");
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = star.style.height = `${Math.random() * 2.5 + 1}px`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 3}s`;
      starsContainer.appendChild(star);
    }
  }

  function formatCapitalizeName(str) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => {
        if (!word) return "";
        const isAllUpper = word.length > 1 && word === word.toUpperCase();
        const rest = isAllUpper ? word.slice(1).toLowerCase() : word.slice(1);
        return word.charAt(0).toUpperCase() + rest;
      })
      .join(" ");
  }

  // 2. Read Guest Name from URL Parameter (e.g. ?nama=alfian -> Alfian)
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get("nama") || urlParams.get("to") || urlParams.get("u");
  const guestDisplay = document.getElementById("guestNameDisplay");
  const guestNameInput = document.getElementById("guestNameInput");

  if (guestParam && guestParam.trim() !== "") {
    const rawGuest = decodeURIComponent(guestParam.trim().replace(/\+/g, " "));
    const formattedGuest = formatCapitalizeName(rawGuest);
    if (guestDisplay) guestDisplay.textContent = formattedGuest;
    if (guestNameInput) guestNameInput.value = formattedGuest;
  } else {
    if (guestDisplay) guestDisplay.textContent = "Tamu Undangan Terhormat";
  }

  // 2B. Theme Style Selection System (Default, Pink, Biru, Coklat, Kuning)
  function applyTheme(themeName) {
    const validThemes = ["default", "pink", "biru", "coklat", "kuning"];
    if (!themeName || !validThemes.includes(themeName.toLowerCase())) {
      themeName = "default";
    } else {
      themeName = themeName.toLowerCase();
    }

    currentTheme = themeName;
    icons = themeIcons[themeName] || themeIcons.default;
    document.documentElement.setAttribute("data-theme", themeName);
    try {
      localStorage.setItem("wedding_theme", themeName);
    } catch (e) {
      console.warn("Storage access restricted:", e);
    }

    // Update active state in cover chips
    document.querySelectorAll(".theme-chip").forEach((chip) => {
      const isMatch = chip.getAttribute("data-theme") === themeName;
      chip.classList.toggle("active", isMatch);
    });

    // Update active state in floating dropdown options
    document.querySelectorAll(".palette-option").forEach((opt) => {
      const isMatch = opt.getAttribute("data-theme") === themeName;
      opt.classList.toggle("active", isMatch);
    });
  }

  // Bind Cover Theme Chips
  document.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const theme = chip.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  // Bind Floating Theme Switcher & Dropdown Modal
  const themeFloatingBtn = document.getElementById("themeFloatingBtn");
  const themePaletteModal = document.getElementById("themePaletteModal");
  const closePaletteBtn = document.getElementById("closePaletteBtn");

  if (themeFloatingBtn && themePaletteModal) {
    themeFloatingBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      themePaletteModal.classList.toggle("is-open");
    });

    if (closePaletteBtn) {
      closePaletteBtn.addEventListener("click", () => {
        themePaletteModal.classList.remove("is-open");
      });
    }

    document.querySelectorAll(".palette-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const theme = opt.getAttribute("data-theme");
        applyTheme(theme);
        themePaletteModal.classList.remove("is-open");
        showToast(`Nuansa warna: ${theme.toUpperCase()}`);
      });
    });

    document.addEventListener("click", (e) => {
      if (!themePaletteModal.contains(e.target) && e.target !== themeFloatingBtn) {
        themePaletteModal.classList.remove("is-open");
      }
    });
  }

  // Check URL parameter for theme override (?theme=pink/biru/coklat/kuning/default)
  const urlTheme = urlParams.get("theme");
  if (urlTheme && ["default", "pink", "biru", "coklat", "kuning"].includes(urlTheme.toLowerCase())) {
    applyTheme(urlTheme);
  } else {
    try {
      const savedTheme = localStorage.getItem("wedding_theme");
      if (savedTheme) applyTheme(savedTheme);
    } catch (e) {
      applyTheme("default");
    }
  }

  // 3. Audio & Music Player System
  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  let isMusicPlaying = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      if (musicToggle) {
        musicToggle.classList.add("playing");
      }
    }).catch((err) => {
      console.warn("Audio autoplay blocked by browser:", err);
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    if (musicToggle) {
      musicToggle.classList.remove("playing");
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (isMusicPlaying) {
        pauseMusic();
        showToast("Musik dihentikan");
      } else {
        playMusic();
        showToast("Musik diputar");
      }
    });
  }

  // 4. Open Invitation Sequence
  const openButton = document.getElementById("open");
  const invitation = document.querySelector(".invitation");
  const envelopeWrapper = document.querySelector(".envelope-wrapper");
  let hasOpened = false;

  function revealHeroAndInvitation(animate = true) {
    document.body.classList.add("invitation-open");
    if (invitation) {
      invitation.setAttribute("aria-hidden", "false");
    }

    // Ensure any reveal elements in hero are marked visible immediately
    document.querySelectorAll("#hero .reveal-3d").forEach((el) => {
      el.classList.add("is-visible");
    });

    if (animate && typeof gsap !== "undefined") {
      gsap.fromTo(
        ".hero-couple-title",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out", clearProps: "all" }
      );

      gsap.fromTo(
        [".hero-header", ".hero-date-pill", "#countdownCard", ".explore-btn", ".scroll-hint"],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.8,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }

    initScrollAnimations();

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }

    const hash = window.location.hash;
    if (hash && hash !== "#hero") {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      window.scrollTo(0, 0);
    }
  }

  function openDirectlyWithoutEnvelope() {
    if (hasOpened) return;
    hasOpened = true;

    const overlay = document.querySelector(".overlay");
    if (overlay) overlay.style.display = "none";

    playMusic();
    revealHeroAndInvitation(false);
  }

  function openInvitation() {
    if (hasOpened) return;
    hasOpened = true;
    if (openButton) openButton.disabled = true;

    // Start music playback
    playMusic();

    const envelope = document.querySelector(".envelope");
    if (envelope) {
      envelope.style.animation = "none";
    }

    const tl = gsap.timeline();

    tl.to(".seal", {
      opacity: 0,
      scale: 0.8,
      duration: 0.25,
      ease: "power1.out",
    })
      .to(".flap", {
        rotateX: 180,
        duration: 0.7,
        ease: "power2.inOut",
        onUpdate: function () {
          const progress = this.progress();
          const flap = document.querySelector(".flap");
          if (flap) {
            flap.style.zIndex = progress > 0.45 ? "1" : "5";
          }
        },
      }, "<")
      .to(".letter", {
        y: -75,
        zIndex: 7,
        duration: 0.85,
        ease: "power2.out",
      }, "-=0.25")
      .to(".envelope-wrapper", {
        scale: 1.04,
        duration: 0.5,
        ease: "power2.out",
      }, "<")
      .to(".overlay", {
        opacity: 0,
        scale: 0.96,
        duration: 0.75,
        ease: "power2.inOut",
      }, "+=0.3")
      .set(".overlay", { display: "none" })
      .call(() => {
        revealHeroAndInvitation(true);
      });
  }

  if (openButton) openButton.addEventListener("click", openInvitation);
  if (envelopeWrapper) envelopeWrapper.addEventListener("click", openInvitation);

  // Auto-open directly if opened=true is present in URL (e.g. from finished game)
  if (urlParams.get("opened") === "true") {
    openDirectlyWithoutEnvelope();
  }

  // 5. Semi-3D Scroll Trigger Animations
  function initScrollAnimations() {
    const revealElements = document.querySelectorAll(".invitation .reveal-3d:not(#hero .reveal-3d)");

    if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
      revealElements.forEach((elem) => {
        ScrollTrigger.create({
          trigger: elem,
          start: "top 85%",
          onEnter: () => elem.classList.add("is-visible"),
          once: true,
        });
      });
    } else {
      // Fallback with IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealElements.forEach((el) => observer.observe(el));
    }
  }

  // 6. Interactive 3D Tilt Effect for Desktop & Touch
  const tiltCards = document.querySelectorAll("[data-tilt], .profile-card, .event-box, .bank-card");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -9;
      const rotateY = ((x - centerX) / centerX) * 9;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });

  // 7. Live Wedding Countdown Timer
  const targetWeddingDate = new Date("2026-12-20T08:00:00+07:00").getTime();
  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMinutes = document.getElementById("cdMinutes");
  const cdSeconds = document.getElementById("cdSeconds");

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetWeddingDate - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (cdDays) cdDays.textContent = String(days).padStart(2, "0");
      if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
      if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, "0");
      if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, "0");
    } else {
      if (cdDays) cdDays.textContent = "00";
      if (cdHours) cdHours.textContent = "00";
      if (cdMinutes) cdMinutes.textContent = "00";
      if (cdSeconds) cdSeconds.textContent = "00";
    }
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // 8. Clipboard Copy Functionality with Toast Notification
  const toast = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const textToCopy = btn.getAttribute("data-copy");
      const label = btn.getAttribute("data-label") || "Teks";

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`${label} berhasil disalin!`);
        }).catch(() => {
          fallbackCopy(textToCopy, label);
        });
      } else {
        fallbackCopy(textToCopy, label);
      }
    });
  });

  function fallbackCopy(text, label) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(`${label} berhasil disalin!`);
    } catch (err) {
      showToast("Gagal menyalin otomatis");
    }
    document.body.removeChild(textArea);
  }

  // 9. Gallery Lightbox Modal
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxBackdrop = document.querySelector(".lightbox-backdrop");
  const galleryCards = document.querySelectorAll(".gallery-card");

  galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const src = card.getAttribute("data-src");
      const caption = card.getAttribute("data-caption");
      if (lightboxImage) lightboxImage.src = src;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxModal) {
        lightboxModal.classList.add("active");
        lightboxModal.setAttribute("aria-hidden", "false");
      }
    });
  });

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove("active");
      lightboxModal.setAttribute("aria-hidden", "true");
    }
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // 10. Interactive Guestbook & RSVP System (with LocalStorage)
  const defaultWishes = [
    {
      name: "Dimas & Sarah",
      status: "Hadir",
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair. Selamat menempuh hidup baru Nawawi & Annisa! Semoga senantiasa sakinah, mawaddah, warahmah.",
      time: "2 jam yang lalu",
    },
    {
      name: "Rizky Firmansyah",
      status: "Hadir",
      message: "Masya Allah, selamat bro Nawawi dan Annisa! Lancar-lancar sampai hari H yaa. See you at the grand ballroom!",
      time: "5 jam yang lalu",
    },
    {
      name: "Nadia Utami & Suami",
      status: "Hadir",
      message: "Selamat ya Annisa sayang! Cantik banget undangannya. Semoga langgeng sampai kakek nenek dan dilimpahi kebahagiaan selalu.",
      time: "1 hari yang lalu",
    },
    {
      name: "Fajar Prasetyo",
      status: "Masih Ragu",
      message: "Selamat atas pernikahannya Nawawi & Annisa! Semoga acaranya berkah dan lancar tanpa kendala. Insya Allah diusahakan hadir!",
      time: "2 hari yang lalu",
    },
  ];

  const wishesList = document.getElementById("wishesList");
  const feedCounter = document.getElementById("feedCounter");
  const rsvpForm = document.getElementById("rsvpForm");

  function getStoredWishes() {
    const saved = localStorage.getItem("wedding_wishes");
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultWishes;
      }
    }
    return defaultWishes;
  }

  // Clear / Reset wishes helper
  function clearWishes(mode = "empty", notify = true) {
    if (mode === "default" || mode === "reset") {
      localStorage.removeItem("wedding_wishes");
      if (notify) showToast("🔄 Ucapan dikembalikan ke contoh bawaan.");
    } else {
      localStorage.setItem("wedding_wishes", JSON.stringify([]));
      if (notify) showToast("🧹 Semua ucapan di localStorage berhasil dihapus.");
    }
    renderWishes();
  }

  // Expose global functions to window (DevTools Console)
  window.clearWishes = () => clearWishes("empty");
  window.resetWishes = () => clearWishes("default");

  // Check URL parameters for clear/reset actions:
  // e.g. index.html?clear=wishes or index.html?hapus=ucapan or index.html?reset=wishes
  const resetQuery =
    urlParams.get("reset") ||
    urlParams.get("clear") ||
    urlParams.get("hapus") ||
    urlParams.get("clear_wishes") ||
    urlParams.get("reset_wishes");

  if (resetQuery) {
    if (resetQuery === "wishes" || resetQuery === "ucapan" || resetQuery === "true" || resetQuery === "empty") {
      clearWishes("empty");
    } else if (resetQuery === "default" || resetQuery === "reset") {
      clearWishes("default");
    }

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("reset");
    cleanUrl.searchParams.delete("clear");
    cleanUrl.searchParams.delete("hapus");
    cleanUrl.searchParams.delete("clear_wishes");
    cleanUrl.searchParams.delete("reset_wishes");
    window.history.replaceState({}, document.title, cleanUrl.toString());
  }

  // Check URL Hash for clear/reset:
  // e.g. index.html#clear-wishes or index.html#reset-wishes
  if (window.location.hash === "#clear-wishes" || window.location.hash === "#hapus-ucapan") {
    clearWishes("empty");
  } else if (window.location.hash === "#reset-wishes") {
    clearWishes("default");
  }

  function renderWishes() {
    if (!wishesList) return;
    const wishes = getStoredWishes();
    wishesList.innerHTML = "";

    if (wishes.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-wishes";
      emptyDiv.style.cssText =
        "text-align: center; padding: 28px 16px; color: var(--text-muted); font-size: 13px; letter-spacing: 0.5px;";
      emptyDiv.innerHTML = "✨ Belum ada ucapan doa. Jadilah yang pertama mengirim ucapan selamat!";
      wishesList.appendChild(emptyDiv);
      if (feedCounter) feedCounter.textContent = "0 Ucapan";
      return;
    }

    wishes.forEach((w) => {
      const item = document.createElement("div");
      item.className = "wish-item";

      let badgeClass = "hadir";
      if (w.status === "Tidak Hadir") badgeClass = "tidak-hadir";
      if (w.status === "Masih Ragu") badgeClass = "ragu";

      item.innerHTML = `
        <div class="wish-top">
          <span class="wish-author">${escapeHTML(w.name)}</span>
          <span class="wish-badge ${badgeClass}">${escapeHTML(w.status)}</span>
        </div>
        <p class="wish-message">${escapeHTML(w.message)}</p>
        <span class="wish-time">${w.time || "Baru saja"}</span>
      `;

      wishesList.appendChild(item);
    });

    if (feedCounter) {
      feedCounter.textContent = `${wishes.length} Ucapan`;
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  renderWishes();

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("guestNameInput");
      const statusSelect = document.getElementById("attendanceStatus");
      const messageInput = document.getElementById("wishesInput");

      const nameVal = nameInput ? nameInput.value.trim() : "";
      const statusVal = statusSelect ? statusSelect.value : "Hadir";
      const messageVal = messageInput ? messageInput.value.trim() : "";

      // Support slash commands in wishes message box (/clear, /hapus, /reset)
      if (messageVal === "/clear" || messageVal === "/hapus") {
        clearWishes("empty");
        if (messageInput) messageInput.value = "";
        return;
      }
      if (messageVal === "/reset") {
        clearWishes("default");
        if (messageInput) messageInput.value = "";
        return;
      }

      if (!nameVal || !messageVal) {
        showToast("Mohon lengkapi nama dan ucapan Anda");
        return;
      }

      const newWish = {
        name: nameVal,
        status: statusVal,
        message: messageVal,
        time: "Baru saja",
      };

      const currentWishes = getStoredWishes();
      currentWishes.unshift(newWish);

      try {
        localStorage.setItem("wedding_wishes", JSON.stringify(currentWishes));
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }

      renderWishes();
      if (messageInput) messageInput.value = "";
      showToast("Terima kasih! Doa restu Anda telah terkirim.");
    });
  }

  // 11. Floating Navigation Scroll Spy
  const navItems = document.querySelectorAll(".floating-nav .nav-item");
  const scenes = document.querySelectorAll(".invitation .scene");

  window.addEventListener("scroll", () => {
    let current = "hero";
    const scrollPos = window.scrollY + 200;

    scenes.forEach((scene) => {
      const top = scene.offsetTop;
      const height = scene.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = scene.getAttribute("id");
      }
    });

    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-target") === current) {
        item.classList.add("active");
      }
    });
  }, { passive: true });
});
