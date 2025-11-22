document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.features-track');
    const container = document.querySelector('.features-marquee-container');
    
    if (!track || !container) return;

    // Stop CSS animation
    track.style.animation = 'none';

    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let autoScrollSpeed = 1; // Adjust speed as needed
    let lastTimestamp = 0;

    // Calculate the width of one set of items (half the total width since it's duplicated)
    // We assume the content is duplicated exactly once for the loop
    // A safer way is to measure the first child and multiply by count/2, or just measure total scrollWidth / 2
    // But scrollWidth might include the hidden part.
    // Let's measure the track width.
    
    // We need to ensure images are loaded to get correct width
    // or we can recalculate on resize.
    
    let halfWidth = track.scrollWidth / 2;

    // Use ResizeObserver to handle dynamic content/loading
    const resizeObserver = new ResizeObserver(() => {
        halfWidth = track.scrollWidth / 2;
    });
    resizeObserver.observe(track);

    function autoScroll(timestamp) {
        if (!isDragging) {
            // Time-based scrolling for consistency
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // Move left
            currentTranslate -= autoScrollSpeed * (deltaTime / 16); // Normalize to ~60fps

            // Infinite loop logic
            if (Math.abs(currentTranslate) >= halfWidth) {
                currentTranslate += halfWidth;
            }
            
            setSliderPosition();
        }
        animationID = requestAnimationFrame(autoScroll);
    }

    function setSliderPosition() {
        // Wrap around logic for dragging
        if (currentTranslate > 0) {
            currentTranslate -= halfWidth;
        } else if (Math.abs(currentTranslate) >= halfWidth) {
            currentTranslate += halfWidth;
        }
        
        track.style.transform = `translateX(${currentTranslate}px)`;
    }

    // Drag Events
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('touchstart', touchStart);

    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
        if(isDragging) touchEnd();
    });
    track.addEventListener('touchend', touchEnd);

    track.addEventListener('mousemove', touchMove);
    track.addEventListener('touchmove', touchMove);

    // Prevent context menu on long press
    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    function touchStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        prevTranslate = currentTranslate;
        
        // Cancel auto-scroll animation frame to stop jitter, 
        // but we want to resume it later. 
        // Actually, the autoScroll function checks isDragging, so it will just pause updating.
        // But we need to reset lastTimestamp when resuming.
        
        track.style.cursor = 'grabbing';
    }

    function touchEnd() {
        isDragging = false;
        track.style.cursor = 'grab';
        lastTimestamp = performance.now(); // Reset timer to prevent jump
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

    // Initialize
    track.style.cursor = 'grab';
    // Start the loop
    animationID = requestAnimationFrame(autoScroll);
});
