
namespace tj.utils {
    export function requireModule<T>(name: string): T {
        return require(name) as T;
    }

    const util = requireModule<typeof import("util")>("util");
    export const decoder = new util.TextDecoder();

    export function prettyPrint(obj: any, options?: { hex: boolean }) {
        console.dir(JSON.parse(JSON.stringify(obj, (key, value) => {
            if (key == "tag") {
                return parser.ConstantTag[value];
            }

            if (key == "access_flags") {
                const result: string[] = [];

                const keys = Object.keys(AccessFlags);
                for (let flagValue of keys) {
                    const hex = parseInt(flagValue);
                    if (isNaN(hex)) continue;

                    if (value & hex) {
                        result.push(AccessFlags[hex]);
                    }
                }

                return `${result.join(" ")} (0x${value.toString(16).padStart(4, '0')})`.trim();
            }

            if (key == "m_access_flags") {
                const result: string[] = [];

                const keys = Object.keys(MethodAccessFlags);
                for (let flagValue of keys) {
                    const hex = parseInt(flagValue);
                    if (isNaN(hex)) continue;

                    if (value & hex) {
                        result.push(MethodAccessFlags[hex]);
                    }
                }

                return `${result.join(" ")} (0x${value.toString(16).padStart(4, '0')})`.trim();
            }

            if (key == "bytes") {
                return value.map((x: number) => `${x.toString(16).padStart(2, "0")}`).join(" ") + ` (${decoder.decode(Buffer.from(value))})`;
            }

            if (value instanceof Array && typeof value[0] == "number" && options?.hex) {
                return value.map((x: number) => `${x.toString(16).padStart(2, "0")}`).join(" ");
            }

            if (typeof value === "number" && options?.hex) {
                return `0x${value.toString(16)}`;
            }

            return value;
        }, 2)), { depth: null, colors: true, maxArrayLength: null, compact: true });
    }
}