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

                       bookLink.click(function(event) {
                        event.preventDefault();

                        var selectedID = $(this).data("workID");
                        showBookDetails(selectedID);
                       });

                       bookLink.data("workID", workID);

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
                    totalPages = 0;
                    $("#pagination").hide();
                    $("#searchResults").text("Unable to retreive books.");
                }).always(function() {
                    $("#searchButton").prop("disabled", false);
                    $("#previousPage").prop("disabled", currentPage <=1);
                    $("#nextPage").prop("disabled", currentPage >= totalPages);
                });
            }

           function showBookDetails(workID) {

            workID = workID.replace ("/works/", "");

            var url = "https://openlibrary.org/works/"
             + encodeURIComponent(workID) + ".json";

            $("#bookDetails").text("Loading book information...");

            $.getJSON(url, function(book) {
             $("#bookDetails").empty();

             var title = book.title || "Unknown Title";

             $("#bookDetails").append(
              $("<h3></h3>").text(title)
              );

             $("#bookDetails").append(
              $("<p></p>").text("Work ID: " + workID)
              );

             if (book.covers && book.covers.length > 0){

              var cover = "https://covers.openlibrary.org/b/id/"
               + book.covers[0] + "-M.jpg";

              $("#bookDetails").append(
               $("<img>")
                 .attr("src", cover)
                 .attr("alt", "Cover of " + title)
              );

             } else {

              $("#bookDetails").append(
                $("<p></p>").text("No cover available")
               );

             }

             if (book.authors && book.authors.length > 0) {

              var authorNames = [];

              for (var i = 0; i < book.authors.length; i++) {

               var authorID = book.authors[i].author.key;

               $.getJSON("https://openlibrary.org" + authorID + ".json", function(author) {

                authorNames.push(author.name);

                $("#authorInfo").text("Author(s): " + authorNames.join(", "));

               });
              }

              $("#bookDetails").append(
               $("<p></p>").attr("id", "authorInfo").text("Loading author(s)...")
               );

             } else {

              $("#bookDetails").append(
               $("<p></p>").text("No author information available")
               );

             }

             var description = "No description available.";
             
             if (typeof book.description === "string") {
              description = book.description;

             } else if (book.description && book.description.value) {

              description = book.description.value;

             }

             $("#bookDetails").append(
              $("<p></p>").text(description)
              );

             if (book.subjects && book.subjects.length > 0) {

              $("#bookDetails").append(
               $("<h4></h4>").text("Subjects:")
               );

              var subjectList = $("<ul></ul>");
              

             for (var i = 0; i < Math.min(10, book.subjects.length); i++) {

              subjectList.append(
               $("<li></li>").text(book.subjects[i])
               );
             }

             $("#bookDetails").append(subjectList);

            } else {

             $("#bookDetails").append(
              $("<p></p>").text("No subjects available")
                );

            }

            var openLibraryURL = "https://openlibrary.org/works/" + workID;

             $("#bookDetails").append(
              $("<p></p>").append(
               $("<a></a>")
                .attr("href", openLibraryURL)
                .attr("target", "_blank")
                .attr("rel", "noopener noreferrer")
                .text("View on Open Library")
               )
              );

            }).fail(function() {

             $("#bookDetails").text("Unable to retreive book information.");
                                       
        });
           }
    function loadBookCollection() {

     var url = "https://openlibrary.org/subjects/history.json?limit=10";

     $("#collectionResults").text("Loading history books...");

     $.getJSON(url, function(data) {

      $("#collectionResults").empty();

      if (!data.works || data.works.length === 0) {
       $("#collectionResults").text("No history books found.");
       return;

      }

      for (var i = 0; i < data.works.length; i++) {

      var book = data.works[i];
      var title = book.title || "Unknown Title";
      var workID = book.key;

       var result = $("<div></div>");

       if (workID) {

        var bookLink = $("<a></a>")
          .attr("href", "#bookDetails")
          .text(title);

        bookLink.data("workID", workID);

        bookLink.click(function(event) {
         event.preventDefault();

         var selectedID = $(this).data("workID");
         showBookDetails(selectedID);

        });

        result.append(
         $("<h3></h3>").append(bookLink)
         );

       } else {

        result.append(
         $("<h3></h3>").text(title)
         );

       }

       $("#collectionResults").append(result);

      }
       
     }).fail(function() {

      $("#collectionResults").text("Unable to retrieve history books.");

     });
    }

  loadBookCollection();

 });
            
    
