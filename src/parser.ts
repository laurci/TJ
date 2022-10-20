namespace tj.parser {
    export enum ConstantTag {
        Class = 7,
        FieldRef = 9,
        MethodRef = 10,
        InterfaceMethodRef = 11,
        String = 8,
        Integer = 3,
        Float = 4,
        Long = 5,
        Double = 6,
        NameAndType = 12,
        Utf8 = 1,
        MethodHandle = 15,
        MethodType = 16,
        InvokeDynamic = 18,
    };

    export enum AttributeTag {
        ConstantValue = "ConstantValue",
        Code = "Code",
        LineNumberTable = "LineNumberTable",
    }

    export interface ConstantInfo<T extends ConstantTag = ConstantTag> {
        tag: T;
    }

    export interface RefWithClassAndTypeInfo {
        class_index: u2;
        name_and_type_index: u2;
    }

    export interface MethodRefConstantInfo extends ConstantInfo<ConstantTag.MethodRef>, RefWithClassAndTypeInfo { }

    export interface FieldRefConstantInfo extends ConstantInfo<ConstantTag.FieldRef>, RefWithClassAndTypeInfo { }

    export interface InterfaceMethodRefConstantInfo extends ConstantInfo<ConstantTag.InterfaceMethodRef>, RefWithClassAndTypeInfo { }

    export interface StringConstantInfo extends ConstantInfo<ConstantTag.String> {
        string_index: u2;
    }

    export interface ClassConstantInfo extends ConstantInfo<ConstantTag.Class> {
        name_index: u2;
    }

    export interface Utf8ConstantInfo extends ConstantInfo<ConstantTag.Utf8> {
        bytes: u1[];
    }

    export interface NameAndTypeConstantInfo extends ConstantInfo<ConstantTag.NameAndType> {
        name_index: u2;
        descriptor_index: u2;
    }

    export interface InterfaceInfo {

    };

    export interface FieldInfo {

    }

    export interface MethodInfo {
        m_access_flags: u2;
        name_index: u2;
        descriptor_index: u2;
        attributes: AttributeInfo[];
    }

    export interface AttributeInfo<T extends AttributeTag = AttributeTag> {
        attribute_tag: T;
        attribute_name_index: u2;
        attribute_length: u4;
    }

    export interface ExceptionTableEntryInfo {
        start_pc: u2;
        end_pc: u2;
        handler_pc: u2;
        catch_type: u2;
    }

    export interface CodeAttributeInfo extends AttributeInfo<AttributeTag.Code> {
        max_stack: u2;
        max_locals: u2;
        code: u1[];
        exception_table: ExceptionTableEntryInfo[];
        attributes: AttributeInfo[];
    }

    export interface LineNumberTableEntryInfo {
        start_pc: u2;
        line_number: u2;
    }

    export interface LineNumberTableAttributeInfo extends AttributeInfo<AttributeTag.LineNumberTable> {
        line_number_table: LineNumberTableEntryInfo[];
    }

    export interface ClassFileInfo {
        magic: u4;
        minor_version: u2;
        major_version: u2;
        constant_pool: ConstantInfo[];
        access_flags: u2;
        this_class: u2;
        super_class: u2;
        interfaces: InterfaceInfo[];
        fields: FieldInfo[];
        methods: MethodInfo[];
    };

    function parseRefWithClassAndTypeConstant(tag: ConstantTag.MethodRef | ConstantTag.InterfaceMethodRef | ConstantTag.FieldRef): MethodRefConstantInfo | InterfaceMethodRefConstantInfo | FieldRefConstantInfo {
        return {
            tag,
            class_index: reader.readU2(),
            name_and_type_index: reader.readU2(),
        };
    }

    function parseStringConstant(): StringConstantInfo {
        return {
            tag: ConstantTag.String,
            string_index: reader.readU2(),
        };
    }

    function parseClassConstant(): ClassConstantInfo {
        return {
            tag: ConstantTag.Class,
            name_index: reader.readU2(),
        };
    }

    function parseUtf8Constant(): Utf8ConstantInfo {
        const length = reader.readU2();
        const bytes = new Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = reader.readU1();
        }

        return { tag: ConstantTag.Utf8, bytes };
    }

    function parseNameAndTypeConstant(): NameAndTypeConstantInfo {
        return {
            tag: ConstantTag.NameAndType,
            name_index: reader.readU2(),
            descriptor_index: reader.readU2(),
        };
    }

    function parseConstant(): ConstantInfo {
        const tag = reader.readU1();

        switch (tag) {
            case ConstantTag.MethodRef:
            case ConstantTag.FieldRef:
            case ConstantTag.InterfaceMethodRef:
                return parseRefWithClassAndTypeConstant(tag);
            case ConstantTag.String:
                return parseStringConstant();
            case ConstantTag.Class:
                return parseClassConstant();
            case ConstantTag.Utf8:
                return parseUtf8Constant();
            case ConstantTag.NameAndType:
                return parseNameAndTypeConstant();
            default:
                throw new Error('unhandled constant tag: ' + tag);
        };
    }

    function parseConstantPool(): ConstantInfo[] {
        const result: ConstantInfo[] = [];

        const constant_poool_count = reader.readU2();
        for (let i = 0; i < constant_poool_count - 1; i++) {
            result.push(parseConstant());
        }

        return result;
    }

    function parseMethod(): MethodInfo {
        const m_access_flags = reader.readU2();
        const name_index = reader.readU2();
        const descriptor_index = reader.readU2();
        const attributes = parseAttributes();

        return {
            m_access_flags,
            name_index,
            descriptor_index,
            attributes,
        };
    }

    function parseMethods(): MethodInfo[] {
        const result: MethodInfo[] = [];

        const methods_count = reader.readU2();
        for (let i = 0; i < methods_count; i++) {
            result.push(parseMethod());
        }

        return result;
    }


    function parseCodeAttribute(attribute_name_index: u2): CodeAttributeInfo {
        const attribute_length = reader.readU4();

        const max_stack = reader.readU2();
        const max_locals = reader.readU2();
        const code_length = reader.readU4();

        const code = new Array(code_length);
        for (let i = 0; i < code_length; i++) {
            code[i] = reader.readU1();
        }

        const exception_table_length = reader.readU2();
        const exception_table = new Array(exception_table_length);
        for (let i = 0; i < exception_table_length; i++) {
            exception_table[i] = {
                start_pc: reader.readU2(),
                end_pc: reader.readU2(),
                handler_pc: reader.readU2(),
                catch_type: reader.readU2(),
            };
        }

        const attributes = parseAttributes();

        return {
            attribute_tag: AttributeTag.Code,
            attribute_name_index,
            attribute_length,
            max_stack,
            max_locals,
            code,
            exception_table,
            attributes,
        };
    }

    function parseLineNumberTableAttribute(attribute_name_index: u2): LineNumberTableAttributeInfo {
        const attribute_length = reader.readU4();

        const line_number_table_length = reader.readU2();
        const line_number_table = new Array(line_number_table_length);
        for (let i = 0; i < line_number_table_length; i++) {
            line_number_table[i] = {
                start_pc: reader.readU2(),
                line_number: reader.readU2(),
            };
        }

        return {
            attribute_tag: AttributeTag.LineNumberTable,
            attribute_name_index,
            attribute_length,
            line_number_table,
        };
    }

    function parseAttribute(): AttributeInfo {
        const attribute_name_index = reader.readU2();

        const name = getUtf8Constant(attribute_name_index);
        switch (name) {
            case AttributeTag.Code:
                return parseCodeAttribute(attribute_name_index);
            case AttributeTag.LineNumberTable:
                return parseLineNumberTableAttribute(attribute_name_index);
            default:
                throw new Error('unhandled attribute tag: ' + name);
        }
    }

    function parseAttributes(): AttributeInfo[] {
        const result: AttributeInfo[] = [];

        const attributes_count = reader.readU2();
        for (let i = 0; i < attributes_count; i++) {
            result.push(parseAttribute());
        }

        return result;
    }

    function getConstant<T extends ConstantInfo>(idx: number): T | undefined {
        return classFileInfo.constant_pool[idx - 1] as T;
    }

    function getUtf8Constant(idx: number) {
        const bytes = getConstant<Utf8ConstantInfo>(idx)?.bytes;
        if (!bytes) throw new Error('invalid utf8 constant index: ' + idx);
        return utils.decoder.decode(Buffer.from(bytes));
    }

    let classFileInfo: ClassFileInfo = {
        magic: 0,
        minor_version: 0,
        major_version: 0,
        constant_pool: [],
        access_flags: 0,
        this_class: 0,
        super_class: 0,
        interfaces: [],
        fields: [],
        methods: [],
    };

    export function parseClassFile(): ClassFileInfo {
        classFileInfo.magic = reader.readU4();
        classFileInfo.minor_version = reader.readU2();
        classFileInfo.major_version = reader.readU2();

        classFileInfo.constant_pool = parseConstantPool();

        classFileInfo.access_flags = reader.readU2();
        classFileInfo.this_class = reader.readU2();
        classFileInfo.super_class = reader.readU2();

        const interfaces_count = reader.readU2();
        // TODO: parse interfaces

        const fields_count = reader.readU2();
        // TODO: parse fields


        classFileInfo.methods = parseMethods();


        return classFileInfo;
    }
}