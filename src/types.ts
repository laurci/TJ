namespace tj {
    export type u1 = number;
    export type u2 = number;
    export type u4 = number;

    export enum AccessFlags {
        Public = 0x0001,
        Final = 0x0010,
        Super = 0x0020,
        Interface = 0x0200,
        Abstract = 0x0400,
        Synthetic = 0x1000,
        Annotation = 0x2000,
        Enum = 0x4000,
    };

    export enum MethodAccessFlags {
        Public = 0x0001,
        Private = 0x0002,
        Protected = 0x0004,
        Static = 0x0008,
        Final = 0x0010,
        Synchronized = 0x0020,
        Bridge = 0x0040,
        Varargs = 0x0080,
        Native = 0x0100,
        Abstract = 0x0400,
        Strict = 0x0800,
        Synthetic = 0x1000,
    };

}