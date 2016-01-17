export async function getKey() {
	var ret;
    await new Promise((resolve) => {
        $(window).keydown((e) => {
			ret = e;
			resolve();
		});
    });

    return ret;
}

export async function getKeyCode() {
    var key = await getKey();
    return key.keyCode;
}

export async function getChar() {
    var code = await getKeyCode();
    return String.fromCharCode(code);
}
