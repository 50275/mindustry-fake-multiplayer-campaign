function switchSector(target){
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
        let planetDialogO = Vars.ui.planet; 
        let planetDialogC = planetDialogO.getClass(); 
        
        // The sector has to be accessible. 
        let canSelectM = planetDialogC.getDeclaredMethod("canSelect", [Sector]); 
        canSelectM.setAccessible(true); 
        if(!canSelectM.invoke(planetDialogO, sector)) return "You can't select this sector: " + String(target); 

        // TODO does this work? 
        let playSelectedM = planetDialogC.getDeclaredMethod("playSelected", null); 
        playSelectedM.setAccessible(true); 
        planetDialogO.selected = sector; 
        playSelectedM.invoke(planetDialogO, null); 
        
        return "HOORAY"; 
    }
    catch(error) {
        return String(error); 
    }
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
        action: u => print(Vars.state.sectors.near())
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
        print(command.action(parameters));
    }
});