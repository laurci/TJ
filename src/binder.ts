namespace tj.binder {
    export class Method {
        public name: string;
        public code?: u1[];

        constructor(public info: parser.MethodInfo, public classFile: ClassFile) {
            this.name = this.classFile.getUtf8(this.info.name_index);

            const codeAttribute = this.info.attributes.find(x => x.attribute_tag == parser.AttributeTag.Code) as parser.CodeAttributeInfo | undefined;

            if (codeAttribute) {
                this.code = codeAttribute.code;
            }
        }
    }

    export class ClassFile {
        public methods: Method[] = [];

        constructor(public info: parser.ClassFileInfo) {
            this.bind();
        }

        public getConstantInfo<T extends parser.ConstantInfo>(idx: number): T | undefined {
            return this.info.constant_pool[idx - 1] as T | undefined;
        }

        public getConstantInfoOrThrow<T extends parser.ConstantInfo>(idx: number): T {
            const info = this.getConstantInfo<T>(idx);
            if (!info) throw new Error(`Invalid constant pool index ${idx}`);
            return info;
        }

        public getUtf8(idx: number): string {
            const info = this.getConstantInfo<parser.Utf8ConstantInfo>(idx);
            if (!info) throw new Error(`Invalid constant pool index ${idx}`);

            return utils.decoder.decode(Buffer.from(info.bytes));
        }

        private bindMethods() {
            for (let methodInfo of this.info.methods) {
                this.methods.push(new Method(methodInfo, this));
            }
        }

        private bind() {
            this.bindMethods();
        }
    };

    export function bindClassFile(_info: parser.ClassFileInfo): ClassFile {
        return new ClassFile(_info);
    }
}