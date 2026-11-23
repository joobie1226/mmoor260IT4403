 $(document).ready(function() {

            var searchTerm = "";
            var currentPage =1;
            var totalPages = 0;
  $("#searchResults").on("click", ".book-link", function(event) {
   event.preventDefault();

   var selectedID = $(this).attr("data-workid");

   if (selectedID) {
    showBookDetails(selectedID);
   }
  });  
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
      
              var books = [];

             for (var i = 0; i < data.docs.length; i++) {
              var book = data.docs[i]; 

              books.push({
               title: book.title || "Unknown Title",
               workID: book.key || "",
               cover: book.cover_i
                   ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-S.jpg"
                   : ""
              });
           }
                 var template = $("#bookTemplate").html();

                 var rendered = Mustache.render(template, {
                   books: books
                 });

                 $("#searchResults").html(rendered);
                 
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
   if (!workID) {
    $("#bookDetails").text("No book selected.");
    return;
   }

   workID = workID.replace("/works/", "");

   var url = "https://openlibrary.org/works/"
    + encodeURIComponent(workID) +".json";

   $("#bookDetails").text("Loading book information...");

   $.getJSON(url, function(book) {

    var title = book.title || "Unknown Title";

    var cover = "";

    if (book.covers && book.covers.length > 0) {
     cover = "https://covers.openlibrary.org/b/id/"
      + book.covers[0] + "-M.jpg";
    }

    var description = "No description available.";

    if (typeof book.description === "string") {
     description = book.description; 
    } else if (book.description && book.description.value) {
     description = book.description.value; 
    }

    var subjects = [];

    if (book.subjects && book.subjects.length > 0) {
     for (var i = 0; i < Math.min(10, book.subjects.length); i++) {
      subjects.push({
       name: book.subjects[i]
      });
     } 
    }

    function renderDetails(authors) {

     var template = $("#detailsTemplate").html(); 

     var rendered = Mustache.render(template, {
      title: title, 
      workID: workID, 
      cover: cover, 
      authors: authors, 
      description: description, 
      subjects: subjects, 
      hasSubjects: subjects.length > 0,
      openLibraryURL: "https://openlibrary.org/works/" + workID
     });

     $("#bookDetails").html(rendered);
    }

    if (book.authors && book.authors.length > 0) {

     var authorRequests = [];

     for (var i = 0; i < book.authors.length; i++) {

      var authorID = book.authors[i].author.key; 

      var request = $.getJSON(
       "https://openlibrary.org" + authorID + ".json" 
       ).then(
        function(author) {
         return author.name || "Unknown Author";
        },
       function() {
        return "Unknown Author";

       }
       
       );

      authorRequests.push(request);
     }

     $.when.apply($, authorRequests).done(function() {

      var authorNames = Array.prototype.slice.call(arguments);

      renderDetails(authorNames.join(", "));
     });

    } else {
       renderDetails("No author information available");
    }

   }).fail(function() {

    $("#bookDetails").text("Unable to retrieve book information.");

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

       if (book.cover_id) {

        var cover = "https://covers.openlibrary.org/b/id/"
        + book.cover_id + "-S.jpg";

        result.append(
         $("<img>")
          .attr("src", cover)
          .attr("alt", "Cover of " + title)
        );

       } else {

        result.append(
         $("<p></p>").text("No cover available.")
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
