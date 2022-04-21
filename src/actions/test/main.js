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
        let diffCommits = await cmd("git", "log", "--format=%H", "origin/main...HEAD")
        let tags = await cmd("git", "describe", "--tags", "--abbrev=0");
        const commitBase = await cmd("git", "rev-list", "-n1", `${tags[0]}`);
        const commitHead = await cmd("git", "rev-list", "-n1", "HEAD");
        const commitMergeBase = await cmd(
            "git",
            "merge-base",
            `-a`,
            `${commitBase[0]}`,
            `${commitHead[0]}`
            );
            let commands = [
            "git",
            "log",
            "--merges",
            "--first-parent",
            "--reverse",
            "--format='%P %s'",
        ];
        if (commitMergeBase[0] === commitHead[0]) {
            commands.push(`${commitMergeBase[0]}...${commitBase[0]}`);
        } else {
            commands.push(`${commitMergeBase[0]}...${commitHead[0]}`);
        }
        const pullRequests = await cmd(...commands);
        core.setOutput("values", {branchesResult, diffCommits, tags, commitBase, commitHead, commitMergeBase, pullRequests})
    }catch(error){
        core.error(error)
        core.setFailed(error)
    }
}
run()