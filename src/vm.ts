namespace tj.vm {

    enum Opcode {
        getstatic = 0xb2,
        ldc = 0x12,
        invokevirtual = 0xb6,
        return = 0xb1
    }

    enum StackItemType {
        StaticRef,
        Constant
    }

    interface StackItem<T extends StackItemType = StackItemType> {
        type: T;
    }

    interface StaticRefStackItem extends StackItem<StackItemType.StaticRef> {
        name: string;
    }

    interface ConstantStackItem extends StackItem<StackItemType.Constant> {
        value: parser.ConstantInfo;
    }

    class Std {
        public static println(text: string) {
            console.log(text);
        }
    }

    export function execute(classFile: binder.ClassFile, methodName: string) {
        const method = classFile.methods.find(x => x.name == methodName);
        if (!method) throw new Error("No main method found");

        const code = method.code;
        if (!code) throw new Error("No code found");

        // let locals: u4[] = [];
        let stack: StackItem[] = [];
        let pc = 0;

        reader.load(Buffer.from(code));

        program: while (true) {
            const opcode = reader.readU1();

            switch (opcode) {
                case Opcode.getstatic:
                    execute_getstatic();
                    break;

                case Opcode.ldc:
                    execute_ldc();
                    break;

                case Opcode.invokevirtual:
                    execute_invokevirtual();
                    break;

                case Opcode.return:
                    execute_return();
                    break program;

                default:
                    throw new Error(`Unhandled opcode 0x${opcode.toString(16).padStart(2, "0")}`);
            }

        }

        function execute_getstatic() {
            const index = reader.readU2();

            const fieldRefInfo = classFile.getConstantInfoOrThrow<parser.FieldRefConstantInfo>(index);

            const refClass = classFile.getConstantInfoOrThrow<parser.ClassConstantInfo>(fieldRefInfo.class_index);
            const refClassName = classFile.getUtf8(refClass.name_index);

            const refMember = classFile.getConstantInfoOrThrow<parser.NameAndTypeConstantInfo>(fieldRefInfo.name_and_type_index);
            const refMemberName = classFile.getUtf8(refMember.name_index);

            // TODO: this is hardcoded shit

            if (refClassName == "java/lang/System" && refMemberName == "out") {
                stack.push({
                    type: StackItemType.StaticRef,
                    name: "System.out"
                } as StaticRefStackItem);
                return;
            }

            throw new Error(`Not implemented! getstatic ${refClassName}.${refMemberName}`);
        }

        function execute_ldc() {
            const index = reader.readU1();

            const constant = classFile.getConstantInfoOrThrow(index);

            stack.push({
                type: StackItemType.Constant,
                value: constant
            } as ConstantStackItem);
        }

        function execute_invokevirtual() {
            const index = reader.readU2();

            const methodRefInfo = classFile.getConstantInfoOrThrow<parser.MethodRefConstantInfo>(index);
            const methodNameInfo = classFile.getConstantInfoOrThrow<parser.NameAndTypeConstantInfo>(methodRefInfo.name_and_type_index);
            const classInfo = classFile.getConstantInfoOrThrow<parser.ClassConstantInfo>(methodRefInfo.class_index);

            const methodName = classFile.getUtf8(methodNameInfo.name_index);
            const className = classFile.getUtf8(classInfo.name_index);

            if (className == "java/io/PrintStream" && methodName == "println") {
                if (stack.length < 2) {
                    throw new Error(`${className}.${methodName} expected 2 arguments`);
                }

                const arg1 = stack.pop()!;
                const thisArg = stack.pop()!;

                if (arg1.type != StackItemType.Constant) {
                    throw new Error(`${className}.${methodName} expected constant as first argument`);
                }

                if (thisArg.type != StackItemType.StaticRef) {
                    throw new Error(`${className}.${methodName} expected static ref as this argument`);
                }

                const staticRef = thisArg as StaticRefStackItem;
                const constant = arg1 as ConstantStackItem;

                if (staticRef.name !== "System.out") {
                    throw new Error(`${className}.${methodName} only supports System.out`);
                }

                if (constant.value.tag != parser.ConstantTag.String) {
                    throw new Error(`${className}.${methodName} only supports string constants`);
                }

                const stringConstant = constant.value as parser.StringConstantInfo;
                const text = classFile.getUtf8(stringConstant.string_index);

                Std.println(text);

                return;
            }

            throw new Error(`Not implemented! invokevirtual ${className}.${methodName}`);
        }

        function execute_return() {
        }
    }
}