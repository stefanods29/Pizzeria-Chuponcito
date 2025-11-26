document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.features-track');
    const container = document.querySelector('.features-marquee-container');
    
    if (!track || !container) return;

    track.style.animation = 'none';

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let autoScrollSpeed = 1; 
    let lastTimestamp = 0;


    
    let halfWidth = track.scrollWidth / 2;

    const resizeObserver = new ResizeObserver(() => {
        halfWidth = track.scrollWidth / 2;
    });
    resizeObserver.observe(track);

    function autoScroll(timestamp) {
        if (!isDragging) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            currentTranslate -= autoScrollSpeed * (deltaTime / 16);

            if (Math.abs(currentTranslate) >= halfWidth) {
                currentTranslate += halfWidth;
            }
            
            setSliderPosition();
        }
        animationID = requestAnimationFrame(autoScroll);
    }

    function setSliderPosition() {
        if (currentTranslate > 0) {
            currentTranslate -= halfWidth;
        } else if (Math.abs(currentTranslate) >= halfWidth) {
            currentTranslate += halfWidth;
        }
        
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    track.addEventListener('mousedown', touchStart);
    track.addEventListener('touchstart', touchStart);

    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
        if(isDragging) touchEnd();
    });
    track.addEventListener('touchend', touchEnd);

    track.addEventListener('mousemove', touchMove);
    track.addEventListener('touchmove', touchMove);

    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    function touchStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        prevTranslate = currentTranslate;
        
        track.style.cursor = 'grabbing';
    }

    function touchEnd() {
        isDragging = false;
        track.style.cursor = 'grab';
        lastTimestamp = performance.now();
    }

    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            const currentDiff = currentPosition - startPos;
            currentTranslate = prevTranslate + currentDiff;
            setSliderPosition();
        }
    }

    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }

    track.style.cursor = 'grab';
    animationID = requestAnimationFrame(autoScroll);
});
