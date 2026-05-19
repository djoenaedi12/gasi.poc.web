export function timeToMinutes(time?: string) {
    if (!time) {
        return undefined;
    }

    const [hours, minutes] = time.split(":").map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return undefined;
    }

    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
    const normalizedMinutes = Math.max(0, Math.min(minutes, 23 * 60 + 59));
    const hours = Math.floor(normalizedMinutes / 60);
    const remainingMinutes = normalizedMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

export function clampMinutes(minutes: number, minTime?: string, maxTime?: string) {
    const minMinutes = timeToMinutes(minTime) ?? 0;
    const maxMinutes = timeToMinutes(maxTime) ?? 23 * 60 + 59;

    return Math.max(minMinutes, Math.min(minutes, maxMinutes));
}

export function roundMinutes(minutes: number, step: number) {
    return Math.round(minutes / step) * step;
}

export function generateTimeSlots(
    step: number,
    minTime?: string,
    maxTime?: string,
) {
    const slots: string[] = [];
    const safeStep = Math.max(1, step);
    const minMinutes = timeToMinutes(minTime) ?? 0;
    const maxMinutes = timeToMinutes(maxTime) ?? 23 * 60 + 59;

    for (let minutes = minMinutes; minutes <= maxMinutes; minutes += safeStep) {
        slots.push(minutesToTime(minutes));
    }

    return slots;
}

export function getCurrentTimeInRange(step: number, minTime?: string, maxTime?: string) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = roundMinutes(currentMinutes, Math.max(1, step));
    const clampedMinutes = clampMinutes(roundedMinutes, minTime, maxTime);

    return minutesToTime(clampedMinutes);
}
