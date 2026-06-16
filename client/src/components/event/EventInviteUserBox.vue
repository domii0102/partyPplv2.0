<template>
    <div class="user-container">
        <div>
            <img :src="props.user.avatar?.url || defaultImage">
            <span>{{ props.user.nickname }}</span>
        </div>
        <button class="btn btn-none" :class="{ invited: added }" @click="inviteUser">
            <i :class="['bi', added ? 'bi-person-plus-fill' : 'bi-person-plus']"></i>
        </button>
    </div>
</template>

<script setup>

    import defaultImage from '../../assets/pfp.jpg';
    import { ref } from 'vue'

    const added = ref(false)
    const isAnimating = ref(false)

    const props = defineProps({
        user: Object
    });
    const emit = defineEmits(['invite'])

    function inviteUser() {
        added.value = true;
        emit('invite', props.user.userId);
    }

    console.log(props.user.avatar);

</script>

<style scoped>
.user-container{
    display: flex;
    border-radius: 20px;
    margin: 0.5rem;
    border: solid var(--accent-purple) 1px;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;
}

.user-container:hover{
    background: color-mix(in srgb, var(--accent-purple) 10%, transparent);
}

.user-container > div {
    display: flex;
    align-items: center;
}

img{
    height: 3rem;
    width: auto;
    aspect-ratio: 1/1;
    border-radius: 5rem;
    border: solid var(--accent-purple) 1px;
    margin: 0.5rem;
}

span{
    font-size: 1.5rem;
    margin-left: 0.5rem;
    font-weight: 300;
}

button{
    margin-right: 1rem;
    font-size: 1.5rem;
    color: var(--accent-orange);
}

.btn.invited {
    color: var(--accent-orange);
    animation: invitePop 0.35s ease;
}

@keyframes invitePop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.btn{
    --bs-btn-border-color: none;
}

</style>