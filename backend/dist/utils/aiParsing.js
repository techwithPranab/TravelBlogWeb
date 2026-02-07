"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepParseIfString = void 0;
// Robust parser for AI generated responses. Tries JSON, JSON5, and conservative string cleaning.
const deepParseIfString = (data) => {
    const tryParseString = (str) => {
        if (typeof str !== 'string')
            return undefined;
        const s = str.trim();
        if (!s)
            return undefined;
        // 1) Try strict JSON
        try {
            return JSON.parse(s);
        }
        catch (e) { }
        // 2) Try JSON5 (handles single quotes, unquoted keys, trailing commas)
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const JSON5 = require('json5');
            return JSON5.parse(s);
        }
        catch (e) { }
        // 3) Try to extract a JSON-like substring (array or object) and parse it
        const arrayMatch = s.match(/\[([\s\S]*)\]/);
        const objMatch = s.match(/\{([\s\S]*)\}/);
        const candidate = arrayMatch ? ('[' + arrayMatch[1] + ']') : (objMatch ? ('{' + objMatch[1] + '}') : null);
        if (candidate) {
            try {
                return JSON.parse(candidate);
            }
            catch (e) { }
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const JSON5 = require('json5');
                return JSON5.parse(candidate);
            }
            catch (e) { }
        }
        // 4) Conservative single-quote -> double-quote conversion for quoted strings only
        try {
            const replaced = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, g1) => `"${g1.replace(/"/g, '\\"')}"`)
                .replace(/([,\{\[]\s*)([A-Za-z0-9_\- ]+)\s*:/g, '$1"$2":');
            return JSON.parse(replaced);
        }
        catch (e) { }
        // 6) Last resort: attempt to execute JavaScript code (for cases where AI returns code)
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const vm = require('vm');
            // Try with parentheses first
            let evaluated = vm.runInNewContext('(' + s + ')', {}, { timeout: 1000 });
            if (evaluated !== undefined) {
                // Convert the evaluated object to JSON and back to ensure it's properly serialized
                try {
                    const jsonString = JSON.stringify(evaluated);
                    return JSON.parse(jsonString);
                }
                catch (e) {
                    // If serialization fails, return the evaluated object as-is
                    return evaluated;
                }
            }
        }
        catch (e) {
            // Try without parentheses
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const vm = require('vm');
                const evaluated = vm.runInNewContext(s, {}, { timeout: 1000 });
                if (evaluated !== undefined) {
                    // Convert the evaluated object to JSON and back to ensure it's properly serialized
                    try {
                        const jsonString = JSON.stringify(evaluated);
                        return JSON.parse(jsonString);
                    }
                    catch (e) {
                        // If serialization fails, return the evaluated object as-is
                        return evaluated;
                    }
                }
            }
            catch (e2) {
                // ignore
            }
        }
    };
    // If it's a string, try to parse it into an object/array/value
    if (typeof data === 'string') {
        const parsed = tryParseString(data);
        if (parsed !== undefined)
            return (0, exports.deepParseIfString)(parsed);
        // Try to find any JSON-like substring and parse that
        const match = data.match(/(\[([\s\S]*)\]|\{([\s\S]*)\})/);
        if (match) {
            const parsedMatch = tryParseString(match[0]);
            if (parsedMatch !== undefined)
                return (0, exports.deepParseIfString)(parsedMatch);
        }
        // Unable to parse - return as-is (likely plain text)
        return data;
    }
    // If it's an array, parse and flatten elements where needed
    if (Array.isArray(data)) {
        const out = [];
        for (const el of data) {
            if (typeof el === 'string') {
                const parsed = tryParseString(el);
                if (parsed !== undefined) {
                    if (Array.isArray(parsed)) {
                        out.push(...parsed.map(item => (0, exports.deepParseIfString)(item)));
                    }
                    else {
                        out.push((0, exports.deepParseIfString)(parsed));
                    }
                }
                else {
                    out.push(el);
                }
            }
            else {
                out.push((0, exports.deepParseIfString)(el));
            }
        }
        return out;
    }
    // If it's an object, recursively apply parsing to its fields
    if (data && typeof data === 'object') {
        const result = Array.isArray(data) ? [] : {};
        for (const key of Object.keys(data)) {
            result[key] = (0, exports.deepParseIfString)(data[key]);
        }
        return result;
    }
    // Return other types as-is
    return data;
};
exports.deepParseIfString = deepParseIfString;
