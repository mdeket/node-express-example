$(document).ready(() => {
    $('.deleteUser').on('click', deleteUser);
});

function deleteUser(event) {
    let confirmation = confirm('Are you sure?');

    if (confirmation) {
        $.ajax({
            type: 'DELETE',
            url: '/users/' + $(event.target).data('id')

        }).done(function () {
            window.location.replace('/');
        });

    }

}
