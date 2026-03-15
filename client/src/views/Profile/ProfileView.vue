<template>
    <div class="profile-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-auto text-center text-md-start mb-3 mb-md-0">
                    <div class="avatar-container mx-auto mx-md-0">
                        <img class="avatar-img" :src="defaultImage" alt="Avatar" >
                    </div>
                </div>
                <div class="col-md">
                    <div class="profile-info text-center text-md-start ms-md-4">
                        <h1>{{ userName }}</h1>
                        <div class="nickname">{{ nickname }}</div>
                        <div class="stats">
                            {{ 67 }} friends
                        </div>
                        <a class="btn btn-edit-profile">
                            Edit profile
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="gradient-line"></div>

    <div class="container pb-5">
        <div class="row mb-5">
            <div class="section-title col-12 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Your events</h2>
                    <div class="gradient-line"></div>
                </div>
                <div>
                    <FontAwesomeIcon icon="chevron-left" class="icon"></FontAwesomeIcon>
                    <FontAwesomeIcon icon="chevron-right" class="icon"></FontAwesomeIcon>
                </div>
            </div>
            
            <div class="col-12 event-scroll-container">
                To twoje
            </div>
        </div>

        <div class="row">
            <div class="section-title col-12 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Events you're participating in</h2>
                    <div class="gradient-line"></div>
                </div>
                <div>
                    <FontAwesomeIcon icon="chevron-left" class="icon"></FontAwesomeIcon>
                    <FontAwesomeIcon icon="chevron-right" class="icon"></FontAwesomeIcon>
                </div>
            </div>
            <div class="col-12 event-scroll-container">
                Tu bylas i bylo fajnie
            </div>
        </div>
    </div>
</template>

<style scoped>
.icon{
    cursor: pointer;
    color: var(--text-muted);
}
.profile-header{
    background: linear-gradient(270deg, var(--bg-main), var(--accent-purple), transparent 1000%);
    padding: 4rem;
}
.avatar-container{
    width: auto;
    height: auto;
    max-width: 240px;
    aspect-ratio: 1/1;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--accent-purple);
}
.avatar-img{
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.gradient-line{
    height: 2px;
    width: 100%;
    background: var(--line-gradient);
}
.profile-info h1{
    font-size: 3.5rem;
    font-weight: 300;
    margin-bottom: 0;
    color: var(--text-main);
}
.profile-info .nickname {
    color: var(--accent-orange);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-style: italic;
}
.stats {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
}
.btn-edit-profile {
    background: transparent;
    border: 1px solid var(--accent-orange);
    color: var(--text-main);
    padding: 8px 30px;
    border-radius: 20px;
    transition: all 0.3s;
}

.btn-edit-profile:hover {
    background: var(--accent-orange);
    text-decoration: none;
}
.section-title{
    margin-top: 2rem;
}
.section-title h2{
    font-size: 1.7rem;
    font-weight: 400;
}
</style>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import defaultImage from '../../assets/horsegiirl.jpg';
const userName = "Agnieszka Końska"
const nickname = "HorseGiirL"
const friendCount = 67
</script>