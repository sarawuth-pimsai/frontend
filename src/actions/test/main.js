import { getExecOutput } from "@actions/exec";
const core = require("@actions/core");

export async function cmd(commandLine, ...args) {
    core.info(`The command ${commandLine} ${args.join(" ")}`);
    const options = { ignoreReturnCode: true, silent: true };
    const output = await getExecOutput(commandLine, args, options);
    if (output.exitCode > 0) throw new Error(output.stderr);
    return output.stdout.split("\n").filter((o) => o !== "");
}
async function run(){
    try{
        const toke = core.getInput('token')
        const branchesResult = await cmd('git', 'branch')
        console.log(branchesResult)
        core.setOutput("values", branchesResult)
    }catch(error){
        core.error(error)
        core.setFailed(error)
    }
}
run()