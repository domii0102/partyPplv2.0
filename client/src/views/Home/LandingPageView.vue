<template>
    <section class="hero">
        <div class="hero-inner container">
            <!-- lewa karta -->
            <div class="hero-card neon-frame">
                <h2 class="hero-card-title">PartyPpl</h2>
                <p class="hero-card-text">
                    Dołącz do społeczności imprezowiczów! Twórz, planuj i przeżywaj niezapomniane wydarzenia razem z nami.
                </p>

                <div class="hero-buttons">
                    <a class="btn btn-hero-primary">Join us!</a>
                    <a class="btn btn-hero-secondary">Learn more</a>
                </div>
            </div>

            <!-- prawa karta (koła ze zdjęciami)-->
            <div class="hero-circles">

                <!-- duże koło -->
                <div class="circle-big neon-ring"
                    style="background-image:url('/src/assets/party1.png')"></div>

                <!-- małe prawe górne -->
                <div class="circle-small top-right neon-ring"
                    style="background-image:url('/src/assets/city1.png')"></div>

                <!-- małe prawe dolne -->
                <div class="circle-small bottom-right neon-ring" 
                style="background-image:url('/src/assets/party2.png')"></div>

            </div>
        </div>
    </section>
    <section class="about">
        <div class="container">
            <h2 class="about-title">About Us</h2>
            <div class="about-line"></div>
            <p class="about-text">
                Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam...
            </p>
        </div>
    </section>
</template>

<script setup>
</script>

<style scoped>
.hero{
    background: var(--bg-hero);
    min-height: 70vh;
    display: flex;
    align-items: center;
    padding: 80px 0;
}

.hero-inner{
    width: 100%;
    max-width: 1150px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 80px;
}

.hero-card{
    width: 100%;
    max-width: 360px;
    padding: 50px 38px;
    background: var(--card-bg);  /* ⬅ tu działa zmiana dla light/dark */
    border-radius: 24px;
    text-align: center;
    position: relative;

    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

@media (max-width: 992px) {
    .hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
        justify-items: center;
        gap: 40px;
    }

    .hero-circles {
        width: 420px;
        height: 360px;
        margin-top: 10px;
    }

    .circle-big { left: 60px; }
}

.hero-card-title {
    font-size: 32px;
    margin-bottom: 18px;
    color: var(--text-main);
}

.hero-card-text {
    color: var(--text-muted);
    line-height: 1.6;
    font-size: 15px;
}

.neon-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: var(--frame-gradient);

    mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    mask-composite: exclude;

    -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;

    z-index: -1;
}

.neon-frame::after {
    content: "";
    position: absolute;
    inset: -20px;
    border-radius: 32px;
    background: radial-gradient(
        circle,
        rgba(255,159,28,0.4),
        rgba(155,93,229,0.25),
        rgba(255,209,145,0.2)
    );
    filter: blur(40px);
    opacity: 0.6;
    z-index: -2;
}

.hero-buttons {
    margin-top: 26px;
    display: flex;
    gap: 18px;
    justify-content: center;
}

.btn-hero-primary,
.btn-hero-secondary {
    display: inline-block;
    padding: 9px 18px;
    border-radius: 999px;
    font-size: 13px;
    text-decoration: none;
    transition: .25s;
    border: 1.5px solid transparent;
}

.btn-hero-primary {
    color: var(--text-main);
    border-color: var(--accent-soft);
    background: transparent;
    box-shadow: 0 0 12px rgba(255, 209, 145, 0.35);
}
.btn-hero-primary:hover {
    background: var(--accent-soft);
    color: #0b0718;
}

.btn-hero-secondary {
    color: var(--text-main);
    border-color: var(--accent-soft);
    background: transparent;
    opacity: .9;
}
.btn-hero-secondary:hover {
    opacity: 1;
    box-shadow: 0 0 14px rgba(155, 93, 229, 0.45);
}

.hero-circles {
    position: relative;
    width: 520px;
    height: 420px;
}

.neon-ring {
    position: absolute;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    outline: 3px solid transparent;
    box-shadow:
        0 0 0 3px rgba(255,255,255,0.05),
        0 0 20px rgba(255, 159, 28, 0.35),
        0 0 30px rgba(155, 93, 229, 0.35);
}

.neon-ring::before {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: var(--ring-grad);
    z-index: -1;
    filter: blur(6px);
    opacity: 0.8;
}

.circle-big {
    width: 300px;
    height: 300px;
    left: 90px;
    top: 30px;
}

.circle-small {
    width: 150px;
    height: 150px;
}

.circle-small.top-right {
    right: -40px;
    top: 40px;
}

.circle-small.bottom-right {
    right: 20px;
    bottom: 20px;
}

.about {
    background: var(--bg-about);
    padding: 50px 0 70px;
    border-top: 2px solid rgba(255, 159, 28, 0.6);
    text-align: start;
}

.about-title {
    font-size: 26px;
    margin-bottom: 10px;
    color: var(--text-main);
}

.about-line {
    width: 120px;
    height: 3px;
    background: var(--accent-orange);
    margin-bottom: 18px;
}

.about-text {
    color: var(--text-muted);
    max-width: 900px;
    line-height: 1.7;
    font-size: 14px;
}
</style>