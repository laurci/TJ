namespace tj.reader {
    let buffer: Buffer = Buffer.alloc(0);
    let cursor = 0;

    function reset() {
        cursor = 0;
    }

    export function load(buff: Buffer) {
        buffer = buff;

        reset();
    }

    export function readU1() {
        const value = buffer.readUInt8(cursor);
        cursor += 1;
        return value;
    }

    export function readU2() {
        const value = buffer.readUInt16BE(cursor);
        cursor += 2;
        return value;
    }

    export function readU4() {
        const value = buffer.readUInt32BE(cursor);
        cursor += 4;
        return value;
    }
}