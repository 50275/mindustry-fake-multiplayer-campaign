var planetDialogO; 
var planetDialogC; 
var canSelectM; 
var time = 0; 
Events.on(ClientLoadEvent, event => {
    // this shouldn't happen
    if (planetDialogO) return; 
    planetDialogO = Vars.ui.planet; 
    planetDialogC = planetDialogO.getClass(); 
    canSelectM = planetDialogC.getDeclaredMethod("canSelect", [Sector]); 
    canSelectM.setAccessible(true); 
}); 

function switchSector(target){
    // You have to be the host or this mod just disconnects you. 
    if(Vars.net.client()) return "You aren't the host."; 

    // This function is only meaningful if you are in the campaign. 
    if(!Vars || !Vars.state || !Vars.state.sector || !Vars.state.sector.planet) return "You aren't in the campaign."; 

    // You have to target a sector by ID. 
    target = target[0]; 
    target = parseInt(target); 
    if(isNaN(Number(target))) return "This isn't an integer. " + String(target); 
    
    // The ID has to exist. 
    let sectors = Vars.state.sector.planet.sectors;
    if(target < 0 || target >= sectors.size) return "This isn't a valid sector ID. " + String(target); 
    
    // ... 
    let sector = sectors.get(target); 

    // reflection
    try{
        // The sector has to be accessible. 
        if(!canSelectM.invoke(planetDialogO, sector)) return "You can't select this sector: " + String(target); 

        // TODO does this work? 
        let playSelectedM = planetDialogC.getDeclaredMethod("playSelected", null); 
        playSelectedM.setAccessible(true); 

        // planetDialogO.selected = sector; 
        planetDialogO.selectSector(sector); 

        playSelectedM.invoke(planetDialogO, null); 
        
        return "HOORAY"; 
    }
    catch(error) {
        return String(error); 
    }
}
function sayAccessible(){
    
}
const commands = [
    {
        // Print all current args
        word: "#args",
        action: u => print(u)
    },
    {
        // Switch sectors
        word: "#sector", 
        action: u => switchSector(u)
    }, 
    {
        word: "#near",
        action: () => print(Vars.state.sector.near())
    }
]; 
Events.on(PlayerChatEvent, (input) => {
    input = input.message; 
    print(`you:"${input}"`);

    let temp = String(input).split(" "); 
    let keyword = temp[0]; 

    let command = commands.find(u => keyword.split(0, u.word.length) == u.word); 
    if (command == null) {
        print("command null");
        return; 
    }

    else{
        // @Nullable
        let parameters = temp.slice(1); 
        try{
            print(command.action(parameters));
        } catch(error){
            print(error); 
        }
    }
});

/*Okay. The better question is this: LaunchLoadoutDialog and the logic contained within it is the only way to properly initiate a launch. Specifically, it's the only way to choose the launch loadout, check if the launch loadout is valid, check if you have the resources to do so... it's really the backbone for all the logic in addition to the UI itself. However, LaunchLoadoutDialog is designed with the assumption that you are the host. Use it to launch on a server and it will send you to your own singleplayer game in your campaign. This is because whatever `Runnable confirm` is passed to LaunchLoadoutDialog.show() is clearly targeting the client's sector, as 

That's where I come in. It's clear that  */