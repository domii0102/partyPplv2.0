<template>
    <div class="neon-line"></div>
    <section class="hero">
        <div class="hero-inner container">
            <!-- lewa karta -->
            <div class="hero-card neon-frame">
                <h2 class="hero-card-title">PartyPpl</h2>
                <p class="hero-card-text">
                    Dołącz do społeczności imprezowiczów! Twórz, planuj i przeżywaj niezapomniane wydarzenia razem z nami.
                </p>

                <div class="hero-buttons">
                    <RouterLink to="/register" class="btn btn-hero-primary">Join us!</RouterLink>
                    <a class="btn btn-hero-secondary">Learn more</a>
                </div>
            </div>

            <!-- prawa karta (koła ze zdjęciami)-->
            <div class="hero-circles">

                <!-- duże koło -->
                <div class="circle-big neon-ring"
                    style="background-image:url('/src/assets/party1.png')">
                </div>

                <!-- małe prawe górne -->
                <div class="circle-small top-right neon-ring"
                    style="background-image:url('/src/assets/city1.png')"></div>

                <!-- małe prawe dolne -->
                <div class="circle-small bottom-right neon-ring" 
                style="background-image:url('/src/assets/party2.png')"></div>

            </div>
        </div>
    </section>
    <div class="neon-line"></div>
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
    min-height: 500px;
    height: 70vh;
    max-height: 900px;
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
    padding: 0 5rem;
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

@media (max-width: 900px) {
    .hero{
        height: auto;
    }
    .hero-inner {
        grid-template-columns: 1fr;
        text-align: center;
        justify-items: center;
        gap: 40px;
    }

    .hero-circles {
        display: none;
    }
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
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: medium;
    text-decoration: none;
    transition: .25s;
    border: 1.5px solid transparent;
}

.btn-hero-primary {
    color: var(--text-main);
    border-color: var(--accent-soft);
    background: transparent;
    font-weight: bold;
    box-shadow: 0 0 12px rgba(255, 209, 145, 0.35);
}
.btn-hero-primary:hover {
    background: var(--accent-soft);
    color: #0b0718;
}

.btn-hero-secondary {
    color: var(--text-main);
    border-color: var(--accent-purple);
    background: transparent;
    opacity: .9;
}
.btn-hero-secondary:hover {
    opacity: 1;
    box-shadow: 0 0 14px rgba(155, 93, 229, 0.45);
    background-color: var(--accent-purple);
}

.hero-circles {
    position: relative;
    height: 100%;
    width: 100%;
    min-height: 420px;
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
    z-index: -1;
    filter: blur(6px);
    opacity: 0.8;
}

.circle-big {
    width: 60%;
    height: auto;
    aspect-ratio: 1/1;
    left: 0;
    top: 2rem;
    animation: float 6s ease-in-out infinite;
}

.circle-small {
    width: 30%;
    height: auto;
    aspect-ratio: 1/1;
}

.circle-small.top-right {
    right: 0;
    top: 3rem;
        animation: float 5s ease-in-out infinite;
}

.circle-small.bottom-right {
    right: 2.5rem;
    bottom: 2.5rem;
        animation: float 5.5s ease-in-out infinite;
}

.about {
    background: var(--bg-main);
    padding: 50px 0 70px;
    text-align: start;
    border-bottom: none;
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

@keyframes float {
	0% {
		transform: translatey(0px);
	}
	50% {
		transform: translatey(-20px);
	}
	100% {
		transform: translatey(0px);
	}
}
.neon-line{
    height: 2px;
    width: 100%;
    background: var(--line-gradient);
    background-size: 400%;
    background-repeat: repeat-x;
    animation: gradient-scroll 10s linear infinite;
}
@keyframes gradient-scroll {
    0%   { background-position: 0 0; }
    50%  { background-position: 100% 0; }
    100% { background-position: 0 0; }   
}
</style>