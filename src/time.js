export async function mdelay(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
