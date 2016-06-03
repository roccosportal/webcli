webcli.commandparser = {};

webcli.commandparser._ESCAPDEDESCAPOR = '{!ESCAPDEDESCAPOR!}';
webcli.commandparser._ESCAPEDSPACE = '{!ESCAPEDSPACE!}';


webcli.commandparser.parse = function(s){
    var sEsc = s;
    sEsc = sEsc.replace(/\\\\/g, webcli.commandparser._ESCAPDEDESCAPOR);
    sEsc = sEsc.replace(/\\ /g,  webcli.commandparser._ESCAPEDSPACE);

    // now we can savly split the s to parts
    var parts = sEsc.split(' ');


    var regExpESCAPDEDESCAPOR = new RegExp(webcli.commandparser._ESCAPDEDESCAPOR,"g");
    var regExpESCAPEDSPACE = new RegExp(webcli.commandparser._ESCAPEDSPACE,"g");

    // join all parts together except the last one
    var sStart = parts.slice(0, parts.length -1).join(' ');
    sStart = sStart.replace(regExpESCAPDEDESCAPOR, '\\\\');
    sStart = sStart.replace(regExpESCAPEDSPACE, '\\ ');

    for (var i = 0; i < parts.length; i++) {
      parts[i] = parts[i].replace(regExpESCAPDEDESCAPOR, '\\');
      parts[i] = parts[i].replace(regExpESCAPEDSPACE, ' ');
    }

    var command = parts[0];
    var args = parts.slice(1);

    return {command : command, args : args, parts : parts, s : s, sStart : sStart};
};
