let xOffset = 0,
    yOffset = 0,
    init_x,
    init_y,
    current_x,
    current_y,
    lastValidX,
    lastValidY,
    active = false;

const dragElementStart = e => {
    e.preventDefault();

    init_x = e.clientX - xOffset;
    init_y = e.clientY - yOffset;
    // console.log(current_x, current_y);
    if (e.target === mycam) active = true;
}

const dragging = e => {
    if (active) {
        console.log('dragging');
        e.preventDefault();

        if (e.target === mycam) {
            current_x = e.clientX - init_x;
            current_y = e.clientY - init_y;
            xOffset = current_x;
            yOffset = current_y;
            mycam.style.transform = `translate3d(${current_x}px, ${current_y}px, 0)`;
        }
    }
}

const dragElementEnd = e => {
    const element_style = getComputedStyle(e.target);
    const width = parseInt(element_style.width.match(/\d+/g)[0]);
    const height = parseInt(element_style.height.match(/\d+/g)[0]);

    const LEFT_BOUNDS = innerWidth - width;
    const BOTTOM_BOUNDS = innerHeight - height;

    const element_rect = e.target.getBoundingClientRect();
    const x = element_rect.x;
    const y = element_rect.y;

    if (x <= LEFT_BOUNDS && x >= 0 && y <= BOTTOM_BOUNDS && y >= 0) {
        mycam.style.transform = `translate3d(${current_x}px, ${current_y}px, 0)`;
        lastValidX = current_x;
        lastValidY = current_y;

        init_x = current_x;
        init_y = current_y;
    } else {
        mycam.style.transform = `translate3d(${lastValidX}px, ${lastValidY}px, 0)`;
        current_x = lastValidX;
        current_y = lastValidY;
        init_x = current_x;
        init_y = current_y;
        xOffset = current_x;
        yOffset = current_y;
    }
    active = false;
}

host_feed.addEventListener('mousedown', dragElementStart, false);
document.addEventListener('mouseup', dragElementEnd, false);
document.addEventListener('mousemove', dragging, false);