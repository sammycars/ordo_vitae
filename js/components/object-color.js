/**
 * Object Color Utility - Ordo_Vitae
 * 
 * Determines color based on scheduling state.
 * Used for: GOAL, ACTION, TASK, TODO, HABIT_SON
 * 
 * Color rules:
 * - No quarter: white
 * - Has quarter, no week: orange ("I need a week!")
 * - Has week, no day: yellow ("I need a day!")
 * - Has day, no time: cyan ("I need a time!")
 * - All scheduled: green
 * - Complete: grey (strikethrough)
 * - Rolled over: magenta
 */

class ObjectColor {
    /**
     * Get color for any object
     * @param {object} obj - The object (GOAL, ACTION, TASK, TODO, HABIT_SON)
     * @returns {string} Color hex code
     */
    static get(obj) {
        // Complete = grey
        if (obj.completion_status === 'complete') return '#666666';
        
        // Rolled over = magenta (only TASK and TODO)
        if (obj.rollover || obj.TASK_rollover || obj.TODO_rollover) return '#ff44ff';
        
        // Get scheduling properties
        const hasQuarter = obj.quarter_id || obj.GOAL_quarter_id;
        const hasWeek = obj.week_id || obj.WEEK_id;
        const hasDay = obj.day_id || obj.DAY_id;
        const hasTime = obj.scheduled_time || obj.TASK_scheduled_time;
        
        // No quarter = white (unscheduled)
        if (!hasQuarter) return '#ffffff';
        
        // Has quarter, no week = orange ("I need a week!")
        if (!hasWeek) return '#ff8844';
        
        // Has week, no day = yellow ("I need a day!")
        if (!hasDay) return '#ffff00';
        
        // Has day, no time = cyan ("I need a time!")
        if (!hasTime) return '#44eeff';
        
        // All scheduled = green
        return '#00ff88';
    }

    /**
     * Get color name for display
     * @param {object} obj 
     * @returns {string} Color name
     */
    static getName(obj) {
        const color = this.get(obj);
        const names = {
            '#666666': 'grey',
            '#ff44ff': 'magenta',
            '#ffffff': 'white',
            '#ff8844': 'orange',
            '#ffff00': 'yellow',
            '#44eeff': 'cyan',
            '#00ff88': 'mint'
        };
        return names[color] || 'unknown';
    }

    /**
     * Get CSS class for object (for styling)
     * @param {object} obj 
     * @returns {string} CSS class
     */
    static getClass(obj) {
        if (obj.completion_status === 'complete') return 'status-complete';
        if (obj.rollover || obj.TASK_rollover || obj.TODO_rollover) return 'status-rolled';
        
        const hasQuarter = obj.quarter_id || obj.GOAL_quarter_id;
        const hasWeek = obj.week_id || obj.WEEK_id;
        const hasDay = obj.day_id || obj.DAY_id;
        const hasTime = obj.scheduled_time || obj.TASK_scheduled_time;
        
        if (!hasQuarter) return 'status-unscheduled';
        if (!hasWeek) return 'status-need-week';
        if (!hasDay) return 'status-need-day';
        if (!hasTime) return 'status-need-time';
        return 'status-scheduled';
    }

    /**
     * Apply color to element
     * @param {HTMLElement} element 
     * @param {object} obj 
     */
    static apply(element, obj) {
        const color = this.get(obj);
        element.style.color = color;
        
        if (obj.completion_status === 'complete') {
            element.style.textDecoration = 'line-through';
        }
    }
}

window.ObjectColor = ObjectColor;
