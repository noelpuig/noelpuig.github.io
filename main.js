function smoothScroll(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start' // You can adjust this to 'end' or 'center' if needed
        });
    }
}
