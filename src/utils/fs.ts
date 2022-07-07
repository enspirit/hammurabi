export const fsExists = async (
  filename: string,
): Promise<boolean> => {
  try {
    const stat = await Deno.stat(filename);
    return true;
  } catch (err) {
    return false;
  }
};

export const fileExists = async (
  filename: string,
): Promise<boolean> => {
  try {
    const stat = await Deno.stat(filename);
    return stat.isFile === true;
  } catch (err) {
    return false;
  }
};

export const dirExists = async (
  filename: string,
): Promise<boolean> => {
  try {
    const stat = await Deno.stat(filename);
    return stat.isDirectory === true;
  } catch (err) {
    return false;
  }
};
