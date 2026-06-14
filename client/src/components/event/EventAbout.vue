<template>
    <div class="about-container">
        <section class="about-section">
            <h2 class="section-title">Description</h2>
            <div class="section-content description-text">
                {{ description || 'No description provided.' }}
            </div>
        </section>

        <section class="about-section">
            <h2 class="section-title">Privacy</h2>
            <div class="section-content">
                {{ isPublic ? 'Public' : 'Private' }}
            </div>
        </section>

        <section class="about-section">
            <h2 class="section-title">Location</h2>
            <div class="section-content address-block">
                <p class="place-name">{{ location.name }}</p>  
                <p>{{ location.city }}</p>
                <p>{{ location.street }}</p>
                <p>{{ location.zipCode }} {{ location.city }}</p>
            </div>
        </section>
    </div>
</template>

<script setup>
defineProps({
    description: String,
    isPublic: Boolean,
    location: {
        type: Object,
        default: () => ({
            name: '',
            city: '',
            street: '',
            zipCode: ''
        })
    }
});
</script>

<style scoped>
.about-container {
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
    color: #fff;
}

.about-section {
    margin-bottom: 2.5rem;
}

.section-title {
    color: var(--accent-orange, #ff9f43);
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
}

.section-content {
    font-size: 1rem;
    line-height: 1.5;
    color: #efefef;
}

.description-text {
    white-space: pre-wrap; 
}

.address-block p {
    margin: 0.2rem 0;
}

.place-name {
    font-weight: 600;
}
</style>