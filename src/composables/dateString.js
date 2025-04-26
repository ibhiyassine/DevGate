export function get_date_string(date) {
    if (!date || typeof date.seconds !== "number") {
        return "Invalid date";
    }

    const jsDate = new Date(date.seconds * 1000);
    return jsDate.toLocaleString("en-US", {
        day: "2-digit",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
