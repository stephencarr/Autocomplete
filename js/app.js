var Autocomplete = (function () {

    var autocomplete = {},
        resultMaxCount = 5,
        // Pick out elements by data-ref. Decouple CSS class names from jQuery selects.
        $form = $("form[data-ref='form']"),
        $input = $("input[data-ref='input']"),
        $results = $("div[data-ref='results']"),
        $chosen = $("div[data-ref='chosen']"),
        autoCompleteData = {};

    // Get the data - returns a deferred
    var _getData = function() {
        var url = "countries.json";
        var def = $.getJSON( url, function( data ) {
                      autoCompleteData = data;
                    });
        return def;
    };

    // Get suggestions - returns a results array
    var _getResultsFromString = function (str){
        var data = autoCompleteData;
        var results = [];

        if(str.length){
            // Loop over the data and pull out matches
            for(var i = 0; i < autoCompleteData.length ; i++) {
                if(autoCompleteData[i].countryName.toLowerCase().indexOf(str) >= 0 ){
                    results.push(autoCompleteData[i]);
                }
            }

            if(results.length > resultMaxCount){
                results = results.slice(0, resultMaxCount);
            }
        }

        return results;
    };

    // Build results list - takes a results array
    var _buildResultsList = function (results) {
        var html = '';

        if(results.length > 0) {
            for(var i = 0; i < results.length ; i++) {
                // Some vars for convenience
                var countryName = results[i].countryName,
                    countryCode = results[i].countryCode,
                    image = results[i].imageSmall;
                // Build the template
                html += "<div class='result clearfix' data-ref='result' data-cc=" + countryCode + ">";
                    html += "<div class='result__image'><img alt='" + countryName + "' src='images/" + image + "' width='32' height='16'/></div>";
                    html += "<div class='result__cc'>" + countryCode + "</div>";
                    html += "<div class='result__name'>" + countryName + "</div>";
                html += "</div>";
                
            }
            // Add html to results list
            $results.html(html);
            // Show results
            $results.removeClass('hidden');
            // Add selected
            $results.find("div[data-ref='result']").first().addClass('selected');
            // Bind click
            $results.find("div[data-ref='result']").off().on('click', function(e){
                $this = $(this);
                _addToChosenListByCC($this.data('cc'));
            }).hover(function(){
                $results.find(".selected").removeClass("selected");
                $(this).addClass('selected');
            });
        } else {
            $results.html(html);
            $results.addClass('hidden');
        }

    };

    // Add selected suggestion to list by country code
    var _addToChosenListByCC = function (cc) {
        
        // Setup
        $results.addClass('hidden');
        $input.val('');

        // Find the item we want
        var item,
            html = '';

        for(var i = 0; i < autoCompleteData.length ; i++) {
            if(autoCompleteData[i].countryCode === cc ){
                item = autoCompleteData[i];
            }
        }

        if(item) {
                // Some vars for convenience
                var countryName = item.countryName,
                    countryCode = item.countryCode,
                    image = item.imageLarge;
                // Build the template
                html += "<div class='chosen-item-container'><div class='chosen-item clearfix' data-ref='result' data-cc=" + countryCode + ">";
                    html += "<div class='chosen-item__image'><img alt='" + countryName + "'' src='images/" + image + "' width='128' height='64'/></div>";
                    html += "<div class='chosen-item__metabox'><div class='chosen-item__cc'>" + countryCode + "</div>";
                    html += "<div class='chosen-item__name'>" + countryName + "</div></div>";
                html += "</div></div>";
                
            $chosen.removeClass('hidden');
            $chosen.append(html);
        }
    };

    // Initiate the app
    autocomplete.init = function() {
        // We don't want the form submitting
        $form.submit(function(e){
            e.preventDefault();
        });
        // Load the data and wait for call to be done
        var jqxhr = _getData();
        jqxhr.done(function(){
            // Make input ready
            $input.removeAttr("disabled").focus().on('blur', function(){
                if (!$results.is(':hover')) {
                    $results.addClass('hidden');
                }
            });
            // Bind keypress
            $input.keyup(function(e) {
                var str = this.value.toLowerCase();
                var code = e.which;
                if(code != 13 && code != 40 && code != 38){
                    _buildResultsList(_getResultsFromString(str));
                }
                // TODO: Refactor this stuff

                // Enter
                if(code==13){
                    var cc = $results.find(".selected").data('cc');
                    _addToChosenListByCC(cc);
                }
                // Down
                if(code==40){
                    var $next = $results.find(".selected").next();
                    if($next.length){
                        $results.find(".selected").removeClass("selected").next().addClass("selected");
                    }
                    
                }
                // Up
                if(code==38){
                    var $prev = $results.find(".selected").prev();
                    if($prev.length){
                        $results.find(".selected").removeClass("selected").prev().addClass("selected");
                    }
                }
                e.preventDefault();
            });
        });
    };

    return autocomplete;

}());

Autocomplete.init();