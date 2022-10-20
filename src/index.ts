namespace tj {
    const FS = utils.requireModule<typeof import("fs/promises")>("fs/promises");
    const Path = utils.requireModule<typeof import("path")>("path");

    async function main() {
        const isDebug = process.argv.pop() == "--debug";

        const buffer = await FS.readFile(Path.join(__dirname, "../test/HelloWorld.class"));
        reader.load(buffer);

        const classFileInfo = parser.parseClassFile();

        if (isDebug) {
            utils.prettyPrint(classFileInfo, { hex: true });
        }

        const classFile = binder.bindClassFile(classFileInfo);

        vm.execute(classFile, "main");
    }

    main();
}