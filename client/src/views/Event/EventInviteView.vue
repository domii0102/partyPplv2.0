<template>
<main>
    <div class="invite-main">
        <div class="container">
            <div class="invite-message">
                <h2>{{"You're invited!"}}</h2> <!-- Defaultowa wiadomosc, ale mozna ustawic wlasna ig -->
                <div class="gradient-line"></div>
            </div>
            <h1>{{"Event name"}}</h1>
            <div class="event-author">
                by: {{ "organizer" }}
            </div>
            <div class="event-date">
                <h3>{{ "01 January 1970 00:00" }}</h3>
            </div>
            <div class="event-adress">
                <h3>at: {{ "Place-name" }}</h3>
            </div>
            <br>
            <h3>Accept?</h3>
            <div>
                <button class="accept btn">
                    <i class="bi bi-check"></i>
                </button>
                <button class="decline btn">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        </div>
        <div class="gradient"></div>
    </div>
    <img :src="defaultImage">
</main>
</template>

<script setup>
import defaultImage from '../../assets/horsegiirl.jpg';
</script>

<style scoped>
main {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
    margin-left: 25%;
}
.invite-main {
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
}
.container {
    grid-column: 1;
    background-color: var(--bg-main);
    align-content: center;
    justify-items: center;
}
.gradient {
    grid-column: 2;
    background: linear-gradient(90deg, var(--bg-main), transparent);
}
h1, h2, h3 {
    font-weight: 300;
}
h1{
    margin-bottom: 0;
}
.invite-message {
    display: flex;
    flex-direction: column;
    width: fit-content;
}
.gradient-line {
    height: 2px;
    width: 100%;
    background: var(--line-gradient);
}
.event-author{
    text-align: center;
    font-size: 1rem;
    opacity: 0.9;
    color: var(--accent-orange);
    font-weight: 600;
    font-style: italic;
    margin-bottom: 0.5rem;
}
.accept, .decline {
    font-size: 3rem;
    transition: color 0.3s;
}
.accept {
    color: var(--accent-orange);
}
.decline {
    color: var(--accent-purple)
}
.accept:hover {
    color: var(--text-main);
}
.decline:hover {
    color: var(--text-main);
}
</style>