const modal = document.querySelector('#modal');
const hideModal = () => modal.style.display = 'none';
const showModal = () => modal.style.display = 'inherit';

const notification = document.querySelector('#notification');
const displayNotification = data => {
    notification.textContent = data;
}

[document.querySelector('#webcam'), document.querySelector('#share'), document.querySelector('#chat')]
    .forEach(element => {
        element.addEventListener('click', () => {
            document.querySelector('#keyspace').style.display = "block";
        })
    })