const modal = document.querySelector('#modal');
const hideModal = () => modal.style.display = 'none';
const showModal = () => modal.style.display = 'inherit';

const notification = document.querySelector('#notification');
const displayNotification = (data, status) => {
    notification.style.display = "block";
    notification.textContent = data;
    if (status)
        notification.className = status;
}
const hideNotification = () => {
    notification.className = "";
    notification.style.display = "none";
}

[document.querySelector('#webcam'), document.querySelector('#share'), document.querySelector('#chat')]
.forEach(element => {
    element.addEventListener('click', () => {
        document.querySelector('#keyspace').style.display = "block";
        hideNotification();
    })
});

[document.querySelector('#webcam'), document.querySelector('#share'), document.querySelector('#chat')]
.forEach(element => {
    element.addEventListener('mouseover', e => displayNotification(e.target.getAttribute('data-popup')))
})