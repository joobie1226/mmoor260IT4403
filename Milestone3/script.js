 $(document).ready(function() {

            var searchTerm = "";
            var currentPage =1;
            var totalPages = 0;
  

            $("#searchButton").click(function() {

                searchTerm =$("#searchInput").val().trim();
                currentPage = 1;
                totalPages = 0;
                $("#pagination").hide();

                if (searchTerm === "") {
                    $("#pagination").hide();
                    $("#searchResults").text("Don't leave me empty.");
                    return;
                }
             
                searchBooks();
                
            });

  $("#previousPage").click(function() {
   if (currentPage > 1) {
       currentPage--;
       searchBooks();
   }
  });

  $("#nextPage").click(function () {
   if(currentPage < totalPages) {
      currentPage++;
      searchBooks();
   }
  });
  
            function searchBooks() {

             $("#searchButton").prop("disabled", true);
             $("#previousPage").prop("disabled", true);
             $("#nextPage").prop("disabled", true);
                
                var url = "https://openlibrary.org/search.json?q="
                    + encodeURIComponent(searchTerm) 
                    + "&limit=10&page=" + currentPage;
                

                $("#searchResults").text("Searching...");

                $.getJSON(url, function(data) {
                    $("#searchResults").empty();

                    if(data.docs.length ===0) {
                        $("#pagination").hide();
                        $("#searchResults").text("No books found.");
                        return;
                    }

                    var totalResults =data.numFound || 0;
                    totalPages = Math.min(5, Math.ceil(totalResults / 10));

                 $("#pageInfo").text("Page " + currentPage + " of " + totalPages);
                 $("#previousPage").prop("disabled", currentPage === 1);
                 $("#nextPage").prop("disabled", currentPage === totalPages);
                 $("#pagination").show();

                  
                    

                    for (var i=0; i < data.docs.length; i++) {
                        var book = data.docs[i];
                        var title = book.title || "Unknown Title";
                        
                        var result = $("<div></div>");

                        var workID = book.key;
                        

                    if(workID) {
                        var bookLink = $("<a></a>")
                            .attr("href", "#bookDetails")
                            .text(title);

                        result.append($("<h3></h3>").append(bookLink));
                    } else {
                        
                        result.append($("<h3></h3>").text(title));
                    }

                        if (book.cover_i) {
                            var cover = "https://covers.openlibrary.org/b/id/"
                                + book.cover_i + "-S.jpg";

                            result.append($("<img>").attr("src", cover)
                                          .attr("alt", "Cover of "+ title));
                        } else {
                            result.append("<p>No cover available</p>");
                        }

                        $("#searchResults").append(result);
                    }
                }).fail(function() {
                    $("#pagination").hide();
                    $("#searchResults").text("Unable to retreive books.");
                }).always(function() {
                    $("#searchButton").prop("disabled", false);
                    $("#previousPage").prop("disabled", currentPage <=1);
                    $("#nextPage").prop("disabled", currentPage >= totalPages);
                });
            }
        });
