<template>
    <div @click.self="$emit('close')" class="blur-overlay">
        <main>
            <div class="popup-head">
                <h1>Invite your friends</h1>
                <button class="btn" @click="$emit('close')">
                    <i class="bi bi-x"></i>
                </button>
            </div>
            <div class="friend-list-container">
            </div>
            <h2>...or send them an invitation link!</h2>
            <div class="link-container">
                <div ref="inviteLink" class="invite-link">
                    {{ "partyp.pl/676767" }}
                </div>
                <button class="copy-btn" @click="copyLink">{{ isLinkCopied ? "Copied" : "Copy" }}</button>
            </div>
        </main>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    defineEmits(['close']);

    const isLinkCopied = ref(false);
    const inviteLink = ref(null);

    const copyLink = async () => {
        await navigator.clipboard.writeText(inviteLink.value.innerText);
        isLinkCopied.value = true;
        setTimeout(() => isLinkCopied.value = false, 2000);
    }
</script>

<style scoped>
.blur-overlay{
    display: flex;
    width: 100%;
    height: calc(100vh - var(--header-height));
    position: absolute;
    z-index: 10;
    backdrop-filter: blur(10px);
    justify-content: center;
    align-items: center;
}
main{
    min-height: 600px;
    min-width: 600px;
    max-width: 720px;
    max-height: 720px;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-main);
    padding: 2rem;
    border-radius: 20px;
    border: solid var(--accent-purple);
    display: flex;
    flex-direction: column;
}
.popup-head{
    width: 100%;
    display: flex;
    flex-direction: row;
    position: relative;
    justify-content: center;
}
.popup-head > h1 {
    font-weight: 300;
    margin: 1rem 0 2rem 0;
}
main > h2 {
    font-weight: 300;
    font-size: 1.5rem;
    margin: 1rem 0;
}
.popup-head > button{
    position: absolute;
    right: 0;
    top: 0;
    color: var(--accent-purple);
    font-size: 2rem;
    padding: 0;
    transition: color 0.3s;
}
.popup-head > button:hover{
    color: var(--text-main)
}
.friend-list-container{
    width: 100%;
    border-radius: 20px;
    border: solid var(--accent-purple);
    overflow-y: auto;
    flex: 1;
}
.link-container{
    display: flex;
    flex-direction: row;
    width: 100%;
}
.invite-link{
    width: 100%;
    border-radius: 20px;
    border: solid var(--accent-purple);
    align-content: center;
    margin-right: 1rem;
    font-size: 1.25rem;
}
.copy-btn{
    color: var(--bg-main);
    background-color: var(--accent-purple);
    border: solid var(--accent-purple);
    border-radius: 20px;
    transition: 0.3s;
}
.copy-btn:hover{
    background-color: var(--bg-main);
    color: var(--accent-purple);
}
</style>